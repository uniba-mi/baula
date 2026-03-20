export default async function checkApiNode() {

    console.log("OK")
    return new Promise<void>(async (resolve, reject) => {
        try {
            const response = await fetch("http://localhost:1234/api");
            if (response.ok) {
                console.log("OK2")
                resolve();
            } else {
                console.log("OK3")
                reject(new Error("API Node is not running."));
            }
        } catch (error) {
            reject(error);
        }
    });
}