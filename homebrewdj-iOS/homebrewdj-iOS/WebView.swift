//
//  WebView.swift
//  homebrewdj-iOS
//
//  Created by lenna on 10.07.26.
//

import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let midiManager: MidiManager
    let overlay: [String: Any]
    
    func makeCoordinator() -> Coordinator {
        Coordinator(manager: midiManager)
    }
    

    func makeUIView(context: Context) -> WKWebView {
        let contentController = WKUserContentController()
        contentController.add(
            context.coordinator,
            name: "swift"
        )
        
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isInspectable = true
        context.coordinator.webView = webView
        
        //webView.navigationDelegate = context.coordinator
        
        if let path = Bundle.main.path(
            forResource: "index",
            ofType: "html",
            inDirectory: "dist"
        ) {
            let url = URL(fileURLWithPath: path)
            webView.loadFileURL(
                url,
                allowingReadAccessTo: url.deletingLastPathComponent()
            )
        }

        context.coordinator.sendOverlay(json: overlay)
        context.coordinator.overlay = overlay
        //context.coordinator.midiManager = midiManager
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {}
    
    class Coordinator: NSObject, WKScriptMessageHandler {
        //var manager: MidiManager =
        var webView: WKWebView?
        var overlay: [String: Any]?
        let midiManager: MidiManager
        
        init(manager: MidiManager) {
            midiManager = manager
        }
        
        func sendOverlay(json: [String: Any?]) {
            guard let d = try? JSONSerialization.data(withJSONObject: json),
                  let j = String(data: d, encoding: .utf8)
            else {
                print("invalid")
                return
            }
            
            print(j)
            
            self.webView?.evaluateJavaScript(
                """
                window.nativeOverlay((\(j)));
                """
            )
        }
        
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            //print("JS -> Swift:", message.body)
            
            if let data = message.body as? [String: Any],
               let action = data["action"] as? String {
                   //print("Action:", action)
                   //print("Payload:", data)
                   
                   switch action {
                   case "ready":
                       guard let overlay else {
                           return
                       }
                       sendOverlay(json: overlay)
                       break
                   case "noteOn":
                       let channel = data["channel"]
                       let note = data["sub"]
                       break
                       
                   case "noteOff":
                       
                       break
                       
                   case "cc":
                       let cc = data["main"]
                       let channel = data["channel"]
                       let value = data["sub"]
                       
                       midiManager.sendCC(channel: uint8(channel), controller: uint8(cc), value: uint8(float(value) * 127))
                       break
                       
                
                   default:
                       print("unknown action")
                       break
                   }
               }
        }
    }
}

func uint8(_ value: Any?) -> UInt8 {
    (value as? NSNumber)?.uint8Value ?? 0
}

func float(_ value: Any?) -> Float {
    (value as? NSNumber)?.floatValue ?? 0.0
}
