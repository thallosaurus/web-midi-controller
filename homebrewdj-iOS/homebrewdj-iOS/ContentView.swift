//
//  ContentView.swift
//  homebrewdj-iOS
//
//  Created by lenna on 10.07.26.
//

import SwiftUI

struct OverlayStruct {
    
}

let defaultOverlay: [String: Any] = [
    "id": "test",
    "name": "test overlay",
        "channel": NSNull(),
        "program": NSNull(),
        "style": "",
        "cells": [
            [
                "type": "vert-mixer",
                "id": NSNull(),
                "vert": [
                    [
                        "output": "midi",
                        "channel": 1,
                        "label": "test",
                        "mode": "absolute",
                        "type": "ccslider",
                        "id": NSNull(),
                        "vertical": true,
                        "cc": 3,
                        "value": NSNull()
                    ],
                    [
                        "type": "notebutton",
                        "output": "midi",
                        "channel": 1,
                        "label": "test btn",
                        "mode": "trigger",
                        "id": NSNull(),
                        "note": 60,
                        "value": NSNull()
                    ]
                ]
            ]
        ]
]

struct ContentView: View {
    let midi = MidiManager()
    
    /*let overlays: [[String: Any]] = [
        defaultOverlay
    ]*/
    
    var body: some View {
        NavigationStack {
            List {
                NavigationLink("test") {
                    OverlayView(midi: midi, overlay: defaultOverlay)
                        .navigationTitle("test overlay")
                }

            }
        }
        .onAppear {
            midi.printDestinations()
            //midi.destination(named: "Session 1")
            midi.destination(named: "Model D")
        }
    }
}

#Preview {
    ContentView()
}
