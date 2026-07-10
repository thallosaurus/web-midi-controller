//
//  MidiManager.swift
//  homebrewdj-iOS
//
//  Created by lenna on 10.07.26.
//

import Foundation
import CoreMIDI

final class MidiManager {

    private var client = MIDIClientRef()
    private var outputPort = MIDIPortRef()

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
        destination: MIDIEndpointRef? = nil
    ) {

        guard let destination = destination ?? defaultDestination() else {
            print("No MIDI destination available")
            return
        }

        send(
            bytes: [
                0xB0 | (channel & 0x0F),
                controller,
                value
            ],
            to: destination
        )
    }
    
    func noteOn(
        channel: UInt8,
        note: UInt8,
        velocity: UInt8,
        destination: MIDIEndpointRef? = nil
    ) {
        guard let destination = destination ?? defaultDestination() else {
            print("No MIDI destination available")
            return
        }

        send(
            bytes: [
                0x90 | (channel & 0x0F),
                note,
                velocity
            ],
            to: destination
        )
    }

    func noteOff(
        channel: UInt8,
        note: UInt8,
        velocity: UInt8 = 0,
        destination: MIDIEndpointRef? = nil
    ) {
        guard let destination = destination ?? defaultDestination() else {
            print("No MIDI destination available")
            return
        }

        send(
            bytes: [
                0x80 | (channel & 0x0F),
                note,
                velocity
            ],
            to: destination
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
