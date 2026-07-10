//
//  ContentView.swift
//  homebrewdj-iOS
//
//  Created by lenna on 10.07.26.
//

import SwiftUI

let defaultOverlay: [String: Any] = [
    "id": "test",
    "name": "test overlay",
        "channel": NSNull(),
        "program": NSNull(),
        "style": "",
        "cells": [
            [
                "output": "midi",
                "channel": 1,
                "label": "test",
                "mode": "absolute",
                "type": "ccslider",
                "id": NSNull(),
                "vertical": false,
                "cc": 3,
                "value": NSNull()
            ]
        ]
]

let defaultOverlay_ = """
    {
       "id": "test",
       "name": "test overlay",
       "channel": null,
       "program": null,
       "style": "",
       "cells": [
          {
             "output":"midi",
             "channel":1,
             "label":"test",
             "mode":"absolute",
             "type":"ccslider",
             "id":null,
             "vertical":false,
             "cc":3,
             "value":null
          }
       ]
    }
    """

struct ContentView: View {
    let midi = MidiManager()
    var body: some View {
        WebView(midiManager: midi, overlay: defaultOverlay)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .ignoresSafeArea()
        
            .onAppear {
                midi.printDestinations()
                midi.destination(named: "Session 1")
            }
        
    }
}

#Preview {
    ContentView()
}
