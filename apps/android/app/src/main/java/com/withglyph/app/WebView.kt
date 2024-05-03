package com.withglyph.app

import android.annotation.SuppressLint
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun ChromeWebView(modifier: Modifier = Modifier) {
  AndroidView(factory = { context ->
    WebView(context).apply {
      settings.javaScriptEnabled = true
      webChromeClient = WebChromeClient()

      loadUrl("https://withglyph.com")
    }
  }, modifier = modifier)
}