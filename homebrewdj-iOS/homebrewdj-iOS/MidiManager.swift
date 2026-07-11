//
//  MidiManager.swift
//  homebrewdj-iOS
//
//  Created by lenna on 10.07.26.
//

import Foundation
import CoreMIDI
import Combine
import SwiftUI

class MidiManager: ObservableObject {
    @Published var dests: [( index: Int, name: String)] = []
    @Published var current: Int = 0
    
    private var client = MIDIClientRef()
    private var outputPort = MIDIPortRef()
    private var endpoint: MIDIEndpointRef?

    init() {
        MIDIClientCreateWithBlock(
            "OverlayClient" as CFString,
            &client
        ) { _ in }

        MIDIOutputPortCreate(
            client,
            "Output" as CFString,
            &outputPort
        )
        
        endpoint = defaultDestination()
    }
    
    func refreshDestinations() {
        dests = destinations()
    }

    func destinations() -> [(index: Int, name: String)] {

        let count = MIDIGetNumberOfDestinations()

        return (0..<count).map { index in

            let endpoint = MIDIGetDestination(index)

            var cfName: Unmanaged<CFString>?
            MIDIObjectGetStringProperty(
                endpoint,
                kMIDIPropertyName,
                &cfName
            )

            let name = cfName?.takeRetainedValue() as String? ?? "Unknown"

            return (index, name)
        }
    }
    
    func setEndpoint(id: Int) {
        guard MIDIGetNumberOfDestinations() > 0 else {
            return
        }
        
        endpoint = MIDIGetDestination(id)
        current = id
    }

    func printDestinations() {

        let destinations = destinations()

        print("Destinations: \(destinations.count)")

        for destination in destinations {
            print("\(destination.index): \(destination.name)")
        }
    }

    func destination(named name: String) -> MIDIEndpointRef? {

        for destination in destinations() where destination.name == name {
            return MIDIGetDestination(destination.index)
        }

        return nil
    }

    func defaultDestination() -> MIDIEndpointRef? {

        guard MIDIGetNumberOfDestinations() > 0 else {
            return nil
        }

        return MIDIGetDestination(0)
    }
    
    func sendCC(
        channel: UInt8,
        controller: UInt8,
        value: UInt8,
        //destination: MIDIEndpointRef? = nil
    ) {
        guard let to = endpoint else {
            print("no midi endpoint")
            return
        }
        
        send(
            bytes: [
                0xB0 | (channel & 0x0F),
                controller,
                value
            ],
            to: to
        )
    }
    
    func noteOn(
        channel: UInt8,
        note: UInt8,
        velocity: UInt8,
        destination: MIDIEndpointRef? = nil
    ) {
        guard let to = endpoint else {
            print("no midi endpoint")
            return
        }
        
        send(
            bytes: [
                0x90 | (channel & 0x0F),
                note,
                velocity
            ],
            to: to
        )
    }

    func noteOff(
        channel: UInt8,
        note: UInt8,
        velocity: UInt8 = 0,
        destination: MIDIEndpointRef? = nil
    ) {
        guard let to = endpoint else {
            print("no midi endpoint")
            return
        }
        
        send(
            bytes: [
                0x80 | (channel & 0x0F),
                note,
                velocity
            ],
            to: to
        )
    }
    
    private func send(
        bytes: [UInt8],
        to destination: MIDIEndpointRef
    ) {

        var packetList = MIDIPacketList(
            numPackets: 1,
            packet: MIDIPacket()
        )

        bytes.withUnsafeBytes { buffer in
            withUnsafeMutablePointer(to: &packetList) { listPtr in
                let packet = MIDIPacketListInit(listPtr)
                _ = MIDIPacketListAdd(
                    listPtr,
                    1024,
                    packet,
                    0,
                    bytes.count,
                    buffer.bindMemory(to: UInt8.self).baseAddress!
                )

                MIDISend(
                    outputPort,
                    destination,
                    listPtr
                )
            }
        }
    }
}

struct MidiDestinationPicker: View {

    let midiManager: MidiManager

    @Binding var selectedDestination: Int

    var body: some View {
        Picker("MIDI Destination", selection: $selectedDestination) {
            ForEach(midiManager.destinations(), id: \.index) { destination in
                Text(destination.name)
                    .tag(destination.index)
            }
        }
        .pickerStyle(.menu)
        .onChange(of: selectedDestination) {
            midiManager.setEndpoint(id: selectedDestination)
        }
    }
}
