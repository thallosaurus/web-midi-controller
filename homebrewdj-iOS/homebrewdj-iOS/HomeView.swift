//
//  HomeView.swift
//  homebrewdj-iOS
//
//  Created by lenna on 11.07.26.
//

import SwiftUI

struct HomeView: View {
    let onOpen: () -> Void
    let onSettingsOpen: () -> Void
    var body: some View {
        VStack {
            Button(action: onOpen) {
                Text("Open Default Overlay")
            }
            Button(action: onSettingsOpen) {
                Text("Open Settings")
            }
        }
    }
}
