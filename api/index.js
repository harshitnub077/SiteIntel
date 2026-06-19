const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');
const fs = require('fs');
const util = require('util');
const path = require('path');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);
const { mockUploadToR2 } = require('./r2Mock');

fastify.register(cors, { origin: '*' });
fastify.register(multipart);

// Mock DB
let defects = [];

fastify.get('/ping', async (request, reply) => {
  return { hello: 'world' };
});

fastify.post('/api/defects/upload', async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.code(400).send({ error: 'No photo provided' });

    // Store temporarily
    await pump(data.file, fs.createWriteStream(`uploads/${data.filename}`));

    // 1. Mock Upload to R2
    const photoUrl = await mockUploadToR2(null, data.filename);

    // 2. Call AI Service (FastAPI)
    let aiLabel = 'Unknown';
    let severity = 'low';
    try {
        const aiResponse = await fetch('http://127.0.0.1:8201/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo_url: photoUrl })
        });
        const aiData = await aiResponse.json();
        aiLabel = aiData.label;
        severity = aiData.severity;
    } catch (e) {
        console.error("Failed to reach AI service", e);
    }

    // 3. Mock save to Supabase
    const defect = {
        id: Math.random().toString(36).substr(2, 9),
        photo_url: photoUrl,
        ai_label: aiLabel,
        severity: severity,
        created_at: new Date()
    };
    defects.push(defect);

    return { success: true, defect };
});

fastify.get('/', async (request, reply) => {
    return { status: 'online', service: 'FieldAI Node API', version: '1.0.0' };
});

fastify.get('/api/defects', async (request, reply) => {
    return { defects };
});

fastify.post('/api/billing/checkout', async (request, reply) => {
    const { tier, orgId } = request.body;
    const priceId = tier === 'enterprise' ? 'price_enterprise_mock' : 'price_pro_mock';
    
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('sk_test_...')) {
      return { url: 'https://checkout.stripe.com/mock-session' };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: 'http://localhost:4200/billing?success=true',
        cancel_url: 'http://localhost:4200/billing?canceled=true',
        client_reference_id: orgId
      });
      return { url: session.url };
    } catch (e) {
      console.error(e);
      reply.code(500).send({ error: 'Failed to create checkout session' });
    }
});

fastify.get('/api/reports/:id/pdf', async (request, reply) => {
    const { id } = request.params;
    try {
        const templateHtml = fs.readFileSync(path.join(__dirname, 'templates', 'report.hbs'), 'utf8');
        const template = handlebars.compile(templateHtml);
        
        const html = template({
            inspectionId: id,
            date: new Date().toLocaleDateString(),
            defects: defects
        });

        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });
        
        await browser.close();

        reply.header('Content-Type', 'application/pdf');
        reply.header('Content-Disposition', `attachment; filename="report_${id}.pdf"`);
        reply.send(pdfBuffer);
    } catch (e) {
        console.error(e);
        reply.code(500).send({ error: 'Failed to generate PDF' });
    }
});

fastify.listen({ port: 4201, host: '0.0.0.0' }, (err, address) => {
  if (err) throw err;
  console.log(`API listening on ${address}`);
});
