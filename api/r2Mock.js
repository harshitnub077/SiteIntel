// Mocks Cloudflare R2 upload for MVP local development
const mockUploadToR2 = async (fileBuffer, filename) => {
    console.log(`[R2 Mock] Uploading ${filename} to mock bucket...`);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const fakeUrl = `https://mock-r2.fieldai.com/uploads/${filename}`;
            console.log(`[R2 Mock] Upload complete: ${fakeUrl}`);
            resolve(fakeUrl);
        }, 300); // simulate network latency
    });
};

module.exports = { mockUploadToR2 };
