import { Parser } from 'expr-eval';

export class MathParser {

    public static parse(input: string): (...args: number[]) => any {
        input = this.stripFunctionDeclaration(input);
        return Parser.parse(input).toJSFunction(this.getVariables(input).join(","));
    }

    static getVariables(input: string) {
        return Parser.parse(input).variables();
    }

    static stripFunctionDeclaration(input: string): string {
        const stringParts = input.split("=");
        return stringParts[stringParts.length - 1];
    }

}