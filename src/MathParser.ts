import { Parser } from 'expr-eval';

export class MathParser {

    public static parse(input: string): {
        func: (...args: number[]) => any,
        inputSize: number,
        outputSize: number
    }{
        input = this.stripFunctionDeclaration(input);
        const func = Parser.parse(input).toJSFunction(this.getVariables(input).join(","));
        const inputSize = Parser.parse(input).variables().length;
        const parameterArray = new Array(inputSize).fill(0);
        
        const tempResult = Parser.parse(input).toJSFunction(this.getVariables(input).join(","))(...parameterArray);
        let outputSize = 1;
        if (Array.isArray(tempResult)) {
            outputSize = tempResult.length;
        }

        return {
            func, inputSize, outputSize
        };
    }

    static getVariables(input: string) {
        return Parser.parse(input).variables();
    }

    static stripFunctionDeclaration(input: string): string {
        const stringParts = input.split("=");
        return stringParts[stringParts.length - 1];
    }

}