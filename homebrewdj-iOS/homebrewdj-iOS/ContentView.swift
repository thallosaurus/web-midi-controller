//
//  ContentView.swift
//  homebrewdj-iOS
//
//  Created by lenna on 10.07.26.
//

import SwiftUI

/*
 "output": "midi",
 "channel": 1,
 "label": "test",
 "mode": "absolute",
 "type": "ccslider",
 "id": NSNull(),
 "vertical": true,
 "cc": 3,
 "value": NSNull()
 
 "type": "notebutton",
 "output": "midi",
 "channel": 1,
 "label": "test btn",
 "mode": "trigger",
 "id": NSNull(),
 "note": 60,
 "value": NSNull()
 */

struct WidgetStruct: Codable {
    var id: String?
    var type: String
    var vert: [WidgetStruct]?
    var horiz: [WidgetStruct]?
    var grid: [WidgetStruct]?
    var w: Int?
    var h: Int?
    var output: String?
    var channel: Int?
    var label: String?
    var mode: String?
    var vertical: Bool?
    var cc: Int?
    var note: Int?
}

struct OverlayStruct: Codable {
    var id: String?
    var name: String
    var channel: String?
    var program: String?
    var style: String?
    var cells: [WidgetStruct]
    //var cells: [String: Any]
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
    
    @State private var selectedDestination = 0
    
    var body: some View {
        NavigationStack {
            VStack {
                List {
                    Section("Output") {
                        MidiDestinationPicker(midiManager: midi, selectedDestination: $selectedDestination)
                    }
                    NavigationLink("test") {
                        OverlayView(midi: midi, overlay: defaultOverlay)
                            .navigationTitle("test overlay")
                    }
                }
                
            }
            
        }
        .onAppear {
            midi.printDestinations()
            //midi.destination(named: "Session 1")
            //midi.destination(named: "Model D")
        }
    }
}

#Preview {
    ContentView()
}
