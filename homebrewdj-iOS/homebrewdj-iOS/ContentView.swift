//
//  ContentView.swift
//  homebrewdj-iOS
//
//  Created by lenna on 10.07.26.
//

import SwiftUI

enum AppScreen {
    case home
    case Overlay(OverlayStruct)
    case settings
}

struct WidgetStruct: Codable {
    var id: String?
    let type: String
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
}

let dSlider = WidgetStruct(type: "ccslider", output: "midi", channel: 1, label: "test", mode: "absolute", vertical: false, cc: 3)
let dNote = WidgetStruct(type: "notebutton", output: "midi", channel: 1, label: "test", mode: "trigger", note: 60)
let dVert = WidgetStruct(type: "vert-mixer", vert: [dSlider, dNote])
let dOverlay = OverlayStruct(id: "test", name: "test overlay", cells: [dVert])

struct ContentView: View {
    let midi = MidiManager()
    
    @State private var screen: AppScreen = .home
    @State private var selectedDestination = 0
    
    var body: some View {
        switch screen {
        case .home:
            HomeView(onOpen: {
                screen = .Overlay(dOverlay)
            }, onSettingsOpen: {
                screen = .settings
            })
        case .Overlay(let o):
            OverlayView(midi: midi, overlay: o, onBack: {
                screen = .home
            })
            
        case .settings:
            VStack {
                List {
                    Section("Output") {
                        MidiDestinationPicker(midiManager: midi, selectedDestination: $selectedDestination)
                    }
                }
            }
        }
    }
}

struct ContentViewOld: View {
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
