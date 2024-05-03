package com.withglyph.app

import android.annotation.SuppressLint
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun ChromeWebView(url: String, modifier: Modifier = Modifier) {
  AndroidView(factory = { context ->
    WebView(context).apply {
      settings.javaScriptEnabled = true
      webChromeClient = WebChromeClient()

      loadUrl(url)
    }
  }, modifier = modifier)
}

@Composable
fun WebView(modifier: Modifier = Modifier) {
  Box(modifier = modifier.windowInsetsPadding(WindowInsets.statusBars)) {
    ChromeWebView(url = "https://withglyph.com")
  }
}