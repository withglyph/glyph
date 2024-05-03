import SwiftUI
import WebKit

struct WebKitWebView: UIViewRepresentable {
  var url: String

  func makeUIView(context: Context) -> WKWebView {
    guard let url = URL(string: url) else {
      return WKWebView()
    }

    let webView = WKWebView()
    webView.load(URLRequest(url: url))

    return webView
  }

  func updateUIView(_ uiView: WKWebView, context: Context) {}
}

struct WebView: View {
  var body: some View {
    WebKitWebView(url: "https://withglyph.com").edgesIgnoringSafeArea(.bottom)
  }
}

#Preview {
  WebView()
}
