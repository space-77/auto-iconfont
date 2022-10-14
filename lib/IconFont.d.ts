import puppeteer, { Page, Browser, HTTPResponse } from 'puppeteer-core';
declare type IconFontConfig = {
    username?: string;
    password?: string;
    projectId: string;
    ctoken?: string;
    eggSessIconfont?: string;
};
export default class IconFont {
    page: Page;
    browser: Browser;
    username?: string;
    password?: string;
    projectId: string;
    iconInfo: Record<string, string> | null;
    eventList: Map<string, [Function, Function]>;
    ctoken?: string;
    eggSessIconfont?: string;
    cookies: Record<string, string>;
    constructor(config: IconFontConfig);
    init(): Promise<void>;
    listenPageChange(): void;
    onPageChange(url: string): Promise<puppeteer.HTTPResponse>;
    getIconInfo(): Promise<Record<string, string> | null>;
    getChromePath(): any;
    initBrowser(): Promise<void>;
    login(): Promise<void>;
    loginSuccess(response: HTTPResponse): Promise<void>;
    createFontInfo(cookie: string): Promise<any>;
    checkForm(): Promise<void>;
    getProjectDetail(): Promise<any>;
    handleLoginError(response: HTTPResponse): Promise<void>;
    getCookie(): Promise<void>;
}
export {};
