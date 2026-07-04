declare module 'input' {
    const input: {
        text: (question: string) => Promise<string>;
    };
    export default input;
}
