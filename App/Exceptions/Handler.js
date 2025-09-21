export default () => {
    process.on('unhandledRejection', (error) => {
        console.log(error);
        throw error;
    });
}
