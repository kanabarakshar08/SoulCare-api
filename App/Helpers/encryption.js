import bcrypt from 'bcrypt';
// import config from 'config';

export const encrypt = async (text) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(text, salt);
    // const valid_password = await bcrypt.compare(password, user.password);
}

export const decrypt = (text) => {
    let decipher = crypto.createDecipher(
        process.env.ALGORITHM,
        process.env.ENCRYPTION_KEY
    );
    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}
