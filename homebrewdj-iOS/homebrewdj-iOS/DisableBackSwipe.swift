//
//  DisableBackSwipe.swift
//  homebrewdj-iOS
//
//  Created by lenna on 11.07.26.
//


import SwiftUI

struct DisableBackSwipe: UIViewControllerRepresentable {

    func makeUIViewController(context: Context) -> UIViewController {

        let controller = UIViewController()

        DispatchQueue.main.async {

            controller.navigationController?

                .interactivePopGestureRecognizer?

                .isEnabled = false

        }

        return controller

    }

    func updateUIViewController(

        _ uiViewController: UIViewController,

        context: Context

    ) {}

}