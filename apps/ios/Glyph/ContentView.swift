import SwiftUI

struct ContentView: View {
  @State var isInitializing = true

  var body: some View {
    ZStack {
      if isInitializing {
        SplashView()
          .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
              isInitializing = false
            }
          }
      } else {
        MainView()
      }
    }
  }
}

#Preview {
  ContentView()
}
