import SwiftUI

struct SplashView: View {
  var body: some View {
    ZStack {
      Color(hex: "#171717").edgesIgnoringSafeArea(.all)
      Image("Logo").resizable().scaledToFit().frame(width: 150).padding(40)
    }
  }
}

#Preview {
  SplashView()
}
