import Foundation
import Vision
import CoreImage
import AppKit
let args = CommandLine.arguments
let inURL = URL(fileURLWithPath: args[1]), outURL = URL(fileURLWithPath: args[2])
guard let ci = CIImage(contentsOf: inURL) else { print("no image"); exit(1) }
let req = VNGenerateForegroundInstanceMaskRequest()
let h = VNImageRequestHandler(ciImage: ci)
try h.perform([req])
guard let r = req.results?.first else { print("no result"); exit(1) }
print("instances", r.allInstances.count)
let buf = try r.generateMaskedImage(ofInstances: r.allInstances, from: h, croppedToInstancesExtent: false)
let out = CIImage(cvPixelBuffer: buf)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: out, to: outURL, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("ok")
