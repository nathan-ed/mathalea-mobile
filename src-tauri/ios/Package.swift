// swift-tools-version:5.3
// Plugin « partage » de l'app pour iOS (voir src/partage.rs) : compilé et lié
// par build.rs sur macOS, comme les plugins Tauri officiels.

import PackageDescription

let package = Package(
  name: "mathalea-partage",
  platforms: [
    .iOS(.v14)
  ],
  products: [
    .library(
      name: "mathalea-partage",
      type: .static,
      targets: ["PartagePlugin"])
  ],
  dependencies: [
    // Copié là par build.rs depuis la caisse tauri
    .package(name: "Tauri", path: "../.tauri/tauri-api")
  ],
  targets: [
    .target(
      name: "PartagePlugin",
      dependencies: [
        .byName(name: "Tauri")
      ],
      path: "Sources/PartagePlugin")
  ]
)
