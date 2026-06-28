
const createMeme = async (meme ) => {
    if (meme.audioFile) {
        console.log("createMeme called with audio file path:", meme.audioFile);
        return `new meme from audio: ${meme.audioFile}`;
    }
    return "new meme";
}

const updateMeme = async (meme ) => {
    return "update meme";
}

export { createMeme, updateMeme}
