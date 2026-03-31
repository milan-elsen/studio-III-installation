//
//  ContentView.swift
//  studio-III-installation-ipadclient
//
//  Created by Milan Elsen on 17.03.26.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = DeviceViewModel()
    
    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                GroupBox("Connection") {
                    HStack {
                        Text("State: \(viewModel.connectionState.rawValue)")
                        Spacer()
                        Button("Connect") {
                            viewModel.connect()
                        }
                        .buttonStyle(.borderedProminent)

                        Button("Disconnect") {
                            viewModel.disconnect()
                        }
                        .buttonStyle(.bordered)
                    }
                }

                GroupBox("Weight") {
                    VStack(alignment: .leading, spacing: 12) {
                        Text(viewModel.latestWeightGrams.map { "Latest: \(String(format: "%.1f", $0)) g" } ?? "Latest: --")
                            .font(.title3)
                        Text(viewModel.latestRawValue.map { "Raw: \($0)" } ?? "Raw: --")
                            .font(.subheadline)
                        HStack {
                            Button("Read Weight") {
                                viewModel.requestWeight()
                            }
                            .buttonStyle(.borderedProminent)

                            Button("Read Raw") {
                                viewModel.requestRaw()
                            }
                            .buttonStyle(.bordered)

                            Button("Tare") {
                                viewModel.tare()
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }

                GroupBox("Calibration") {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Known weight (g)")
                                .frame(width: 150, alignment: .leading)
                            TextField("100.0", text: $viewModel.knownWeightText)
                                .textFieldStyle(.roundedBorder)
                                .keyboardType(.decimalPad)
                        }
                        HStack {
                            Text("Scale factor")
                                .frame(width: 150, alignment: .leading)
                            TextField("1.000000", text: $viewModel.calibrationFactorText)
                                .textFieldStyle(.roundedBorder)
                                .keyboardType(.decimalPad)
                        }
                        HStack {
                            Button("Get Factor") {
                                viewModel.requestCalibrationFactor()
                            }
                            .buttonStyle(.bordered)

                            Button("Set Factor") {
                                viewModel.setCalibrationFactor()
                            }
                            .buttonStyle(.bordered)

                            Button("Calibrate") {
                                viewModel.calibrateUsingKnownWeight()
                            }
                            .buttonStyle(.borderedProminent)
                        }
                    }
                }

                GroupBox("Speaker") {
                    HStack {
                        Button("Play Test Tone") {
                            viewModel.playTestTone()
                        }
                        .buttonStyle(.borderedProminent)

                        Button("Stop") {
                            viewModel.stopTone()
                        }
                        .buttonStyle(.bordered)
                    }
                }

                GroupBox("Printer") {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Status: \(viewModel.connectionState == .connected ? "Ready" : "Connect the printer first")")
                            .font(.subheadline)

                        HStack {
                            Button("Print Test Label") {
                                viewModel.printTestLabel()
                            }
                            .buttonStyle(.borderedProminent)
                            .disabled(viewModel.connectionState != .connected)

                            Button("Print Image") {
                                viewModel.printWasteImage()
                            }
                            .buttonStyle(.bordered)
                            .disabled(viewModel.connectionState != .connected)
                        }
                    }
                }

                GroupBox("Device Feed") {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Status: \(viewModel.statusText)")
                        if let errorText = viewModel.errorText {
                            Text("Error: \(errorText)")
                                .foregroundStyle(.red)
                        }
                        Divider()
                        ScrollView {
                            VStack(alignment: .leading, spacing: 4) {
                                ForEach(viewModel.recentLines, id: \.self) { line in
                                    Text(line)
                                        .font(.caption.monospaced())
                                        .textSelection(.enabled)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                            }
                        }
                        .frame(maxHeight: 180)
                    }
                }
                HStack {
                    Spacer()
                    NavigationLink("Start App") {
                        AppView(onPrintReceipt: { receipt in
                            viewModel.printReceipt(receipt)
                        })
                    }
                    .buttonStyle(.glassProminent)
                    Spacer()
                }
                Spacer()
            }
            .padding()
            .navigationTitle("Admin View ")
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
