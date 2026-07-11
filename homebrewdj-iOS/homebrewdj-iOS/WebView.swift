//
//  WebView.swift
//  homebrewdj-iOS
//
//  Created by lenna on 10.07.26.
//

import SwiftUI
import WebKit

struct OverlayView: View {
    let midi: MidiManager
    let overlay: OverlayStruct
    let onBack: () -> Void
    var body: some View {
        ZStack(alignment: .topLeading) {
            WebView(midiManager: midi, overlay: overlay)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .ignoresSafeArea()
                .padding()
            
            HStack {
                Button(action: onBack) {
                    HStack {
                        Image(systemName: "chevron.left")
                        Text("Back")
                    }
                }
                Spacer()
                Text(overlay.name)
                    .bold()
                Spacer()
                Menu("Menu") {
                    Menu("Output") {
                        ForEach(midi.destinations(), id: \.index) { destination in
                            Text(destination.name)
                                .tag(destination.index)
                        }
                    }
                }
            }
            .padding()
        }
    }
}

struct WebView: UIViewRepresentable {
    let midiManager: MidiManager
    let overlay: OverlayStruct
    
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

        //context.coordinator.sendOverlay(json: overlay)
        context.coordinator.overlay = overlay
        //context.coordinator.midiManager = midiManager
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {}
    
    class Coordinator: NSObject, WKScriptMessageHandler {
        //var manager: MidiManager =
        var webView: WKWebView?
        var overlay: OverlayStruct?
        let midiManager: MidiManager
        
        init(manager: MidiManager) {
            midiManager = manager
        }
        
        func sendOverlay(overlay: OverlayStruct) {
            let encoder = JSONEncoder()
            encoder.outputFormatting = .prettyPrinted
            guard let data = try? encoder.encode(overlay) else {
                print("invalid json")
                return
            }
            
            let str = String(data: data, encoding: .utf8)!
            
/*            guard let d = try? JSONSerialization.data(withJSONObject: json),
                  let j = String(data: d, encoding: .utf8)
            else {
                print("invalid")
                return
            }*/
            
            print(str)
            
            self.webView?.evaluateJavaScript("window.nativeOverlay((\(str)))"
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
                       sendOverlay(overlay: overlay)
                       
                   case "noteOn":
                       let channel = data["channel"]
                       let velocity = data["sub"]
                       let note = data["main"]
                       midiManager.noteOn(channel: uint8(channel), note: uint8(note), velocity: uint8(float(velocity) * 127))
                       
                   case "noteOff":
                       let channel = data["channel"]
                       let velocity = data["sub"]
                       let note = data["main"]
                       midiManager.noteOff(channel: uint8(channel), note: uint8(note), velocity: uint8(float(velocity) * 127))
                       
                   case "cc":
                       let cc = data["main"]
                       let channel = data["channel"]
                       let value = data["sub"]
                       print(uint8(float(value) * 127))
                       
                       midiManager.sendCC(channel: uint8(channel), controller: uint8(cc), value: uint8(float(value) * 127))

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
