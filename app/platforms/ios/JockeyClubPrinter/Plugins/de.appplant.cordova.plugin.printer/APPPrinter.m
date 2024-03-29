/*
 Copyright 2013-2014 appPlant UG

 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import "APPPrinter.h"
#import <Cordova/CDVAvailability.h>

@interface APPPrinter ()

@property (retain) NSString* callbackId;

@end


@implementation APPPrinter

/*
 * Checks if the printing service is available.
 *
 * @param {Function} callback
 *      A callback function to be called with the result
 */
- (void) isAvailable:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult;
        BOOL isAvailable = [self isPrintingAvailable];

        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                           messageAsBool:isAvailable];

        [self.commandDelegate sendPluginResult:pluginResult
                                    callbackId:command.callbackId];
    }];
}

/**
 * Sends the printing content to the printer controller and opens them.
 *
 * @param {NSString} content
 *      The (HTML encoded) content
 */
- (void) print:(CDVInvokedUrlCommand*)command
{
    if (!self.isPrintingAvailable) {
        return;
    }

    _callbackId = command.callbackId;

    NSArray*  arguments           = [command arguments];
    NSString* content             = [arguments objectAtIndex:0];
    NSMutableDictionary* settings = [arguments objectAtIndex:1];

    UIPrintInteractionController* controller = [self printController];

    [self adjustPrintController:controller withSettings:settings];
    [self loadContent:content intoPrintController:controller];
    [self presentPrintController:controller];
}

/**
 * Retrieves an instance of shared print controller.
 *
 * @return {UIPrintInteractionController*}
 */
- (UIPrintInteractionController*) printController
{
    return [UIPrintInteractionController sharedPrintController];
}

/**
 * Adjusts the settings for the print controller.
 *
 * @param {UIPrintInteractionController} controller
 *      The print controller instance
 *
 * @return {UIPrintInteractionController} controller
 *      The modified print controller instance
 */
- (UIPrintInteractionController*) adjustPrintController:(UIPrintInteractionController*)controller
                                           withSettings:(NSMutableDictionary*)settings
{
    UIPrintInfo* printInfo             = [UIPrintInfo printInfo];
    UIPrintInfoOrientation orientation = UIPrintInfoOrientationPortrait;
    UIPrintInfoOutputType outputType   = UIPrintInfoOutputGeneral;

    if ([[settings objectForKey:@"landscape"] boolValue]) {
        orientation = UIPrintInfoOrientationLandscape;
    }

    if ([[settings objectForKey:@"graystyle"] boolValue]) {
        outputType = UIPrintInfoOutputGrayscale;
    }

    printInfo.outputType  = outputType;
    printInfo.orientation = orientation;
    printInfo.jobName     = [settings objectForKey:@"name"];
    printInfo.duplex      = [[settings objectForKey:@"duplex"] boolValue];
    printInfo.printerID   = [settings objectForKey:@"printerId"];

    controller.printInfo      = printInfo;
    controller.showsPageRange = NO;

    return controller;
}

/**
 * Adjusts the web view and page renderer.
 */
- (void) adjustWebView:(UIWebView*)page
     andPrintPageRenderer:(UIPrintPageRenderer*)renderer
{
    UIViewPrintFormatter* formatter = [page viewPrintFormatter];
    // margin not required - done in web page
    formatter.contentInsets = UIEdgeInsetsMake(0.0f, 0.0f, 0.0f, 0.0f);

    renderer.headerHeight = -30.0f;
    renderer.footerHeight = -30.0f;
    [renderer addPrintFormatter:formatter startingAtPageAtIndex:0];

    page.scalesPageToFit        = YES;
    page.dataDetectorTypes      = UIDataDetectorTypeNone;
    page.userInteractionEnabled = NO;
    page.autoresizingMask       = (UIViewAutoresizingFlexibleWidth |
                                   UIViewAutoresizingFlexibleHeight);
}

/**
 * Loads the content into the print controller.
 *
 * @param {NSString} content
 *      The (HTML encoded) content
 * @param {UIPrintInteractionController} controller
 *      The print controller instance
 */
- (void) loadContent:(NSString*)content intoPrintController:(UIPrintInteractionController*)controller
{
    UIWebView* page               = [[UIWebView alloc] init];
    UIPrintPageRenderer* renderer = [[UIPrintPageRenderer alloc] init];

    [self adjustWebView:page andPrintPageRenderer:renderer];

    if ([NSURL URLWithString:content]) {
        NSURL *url = [NSURL URLWithString:content];

        [page loadRequest:[NSURLRequest requestWithURL:url]];
    }
    else {
        // Set the base URL to be the www directory.
        NSString* wwwFilePath = [[NSBundle mainBundle] pathForResource:@"www"
                                                                ofType:nil];
        NSURL* baseURL        = [NSURL fileURLWithPath:wwwFilePath];


        [page loadHTMLString:content baseURL:baseURL];
    }

    controller.printPageRenderer = renderer;
}

/**
 * Opens the print controller so that the user can choose between
 * available iPrinters.
 *
 * @param {UIPrintInteractionController} controller
 *      The prepared print controller with a content
 */
- (void) presentPrintController:(UIPrintInteractionController*)controller
{
    if(CDV_IsIPad()) {
        CGRect rect = CGRectMake(40, 30, 0, 0);

        [controller presentFromRect:rect inView:self.webView animated:YES completionHandler:
         ^(UIPrintInteractionController *ctrl, BOOL ok, NSError *e) {
             CDVPluginResult* pluginResult =
             [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

             [self.commandDelegate sendPluginResult:pluginResult
                                         callbackId:_callbackId];
         }];
    }
    else {
        [controller presentAnimated:YES completionHandler:
         ^(UIPrintInteractionController *ctrl, BOOL ok, NSError *e) {
             CDVPluginResult* pluginResult =
             [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

             [self.commandDelegate sendPluginResult:pluginResult
                                         callbackId:_callbackId];
         }];
    }
}

/**
 * Checks either the printing service is avaible or not.
 *
 * @return {BOOL}
 */
- (BOOL) isPrintingAvailable
{
    Class controllerCls = NSClassFromString(@"UIPrintInteractionController");

    if (!controllerCls) {
        return NO;
    }

    return [self printController] && [UIPrintInteractionController
                                      isPrintingAvailable];
}

@end