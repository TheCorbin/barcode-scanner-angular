import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  BarcodeScanner,
  BarcodeFormat,
  LensFacing,
  StartScanOptions,
  Barcode
} from '@capacitor-mlkit/barcode-scanning';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public view_content_visibility: 'hidden' | '' = '';
  public formats: BarcodeFormat[] = [BarcodeFormat.QrCode];
  public lensFacing: LensFacing = LensFacing.Back;
  @ViewChild("square") public squareElement: ElementRef<HTMLDivElement> | undefined;

  constructor(private readonly modalController: ModalController) {}

  // startScan = async () => {
  //   this.view_content_visibility = 'hidden';
  //   console.log('USER LOG, start scan')
  //   // The camera is visible behind the WebView, so that you can customize the UI in the WebView.
  //   // However, this means that you have to hide all elements that should not be visible.
  //   // You can find an example in our demo repository.
  //   // In this case we set a class `barcode-scanner-active`, which then contains certain CSS rules for our app.
  //   document.querySelector('body')?.classList.add('barcode-scanner-active');
  //   document.body.style.background = "transparent";

  //   // Add the `barcodeScanned` listener
  //   const listener = await BarcodeScanner.addListener(
  //     'barcodeScanned',
  //     async result => {
  //       console.log(result.barcode);
  //       this.view_content_visibility = '';
  //     },
  //   );

  //   // Start the barcode scanner
  //   await BarcodeScanner.startScan();
  // };

  public async startScan(): Promise<void> {
    this.view_content_visibility = 'hidden';
    // Hide everything behind the modal (see `src/globals.scss`)
    document.querySelector("body")?.classList.add("barcode-scanning-active");
    document.body.style.background = "transparent";

    const options: StartScanOptions = {
      formats: this.formats,
      lensFacing: this.lensFacing,
    };

    const squareElementBoundingClientRect = this.squareElement?.nativeElement.getBoundingClientRect();
    const scaledRect = squareElementBoundingClientRect
      ? {
          left: squareElementBoundingClientRect.left * window.devicePixelRatio,
          right: squareElementBoundingClientRect.right * window.devicePixelRatio,
          top: squareElementBoundingClientRect.top * window.devicePixelRatio,
          bottom: squareElementBoundingClientRect.bottom * window.devicePixelRatio,
          width: squareElementBoundingClientRect.width * window.devicePixelRatio,
          height: squareElementBoundingClientRect.height * window.devicePixelRatio,
        }
      : undefined;
    const detectionCornerPoints = scaledRect
      ? [
          [scaledRect.left, scaledRect.top],
          [scaledRect.left + scaledRect.width, scaledRect.top],
          [scaledRect.left + scaledRect.width, scaledRect.top + scaledRect.height],
          [scaledRect.left, scaledRect.top + scaledRect.height],
        ]
      : undefined;
    const listener = await BarcodeScanner.addListener("barcodeScanned", async (result) => {
      console.log('USER LOG, the result', JSON.stringify(result));
      this.view_content_visibility = '';
      const cornerPoints = result.barcode.cornerPoints;
      if (detectionCornerPoints && cornerPoints) {
        if (
          detectionCornerPoints[0][0] > cornerPoints[0][0] ||
          detectionCornerPoints[0][1] > cornerPoints[0][1] ||
          detectionCornerPoints[1][0] < cornerPoints[1][0] ||
          detectionCornerPoints[1][1] > cornerPoints[1][1] ||
          detectionCornerPoints[2][0] < cornerPoints[2][0] ||
          detectionCornerPoints[2][1] < cornerPoints[2][1] ||
          detectionCornerPoints[3][0] > cornerPoints[3][0] ||
          detectionCornerPoints[3][1] < cornerPoints[3][1]
        ) {
          return;
        }
      }

      await listener.remove();
      this.closeModal(result.barcode);
    });


    await BarcodeScanner.startScan(options);
    // await secondScanner.startScan();

  }

  stopScan = async () => {
    // Make all elements in the WebView visible again
    document.querySelector('body')?.classList.remove('barcode-scanner-active');

    // Remove all listeners
    await BarcodeScanner.removeAllListeners();

    // Stop the barcode scanner
    await BarcodeScanner.stopScan();
  };

  scanSingleBarcode = async () => {
    return new Promise(async resolve => {
      document.querySelector('body')?.classList.add('barcode-scanner-active');

      const listener = await BarcodeScanner.addListener(
        'barcodeScanned',
        async result => {
          await listener.remove();
          document
            .querySelector('body')
            ?.classList.remove('barcode-scanner-active');
            console.log("USER LOG, SCANNED!")
          await BarcodeScanner.stopScan();

          resolve(result.barcode);
        },
      );

      await BarcodeScanner.startScan();
    });
  };

  public async closeModal(barcode?: Barcode): Promise<void> {
    this.modalController.dismiss({
      barcode: barcode,
    });
  }

  scan = async () => {
    const { barcodes } = await BarcodeScanner.scan({
      formats: [BarcodeFormat.QrCode],
    });
    return barcodes;
  };

  isSupported = async () => {
    const { supported } = await BarcodeScanner.isSupported();
    return supported;
  };

  enableTorch = async () => {
    await BarcodeScanner.enableTorch();
  };

  disableTorch = async () => {
    await BarcodeScanner.disableTorch();
  };

  toggleTorch = async () => {
    await BarcodeScanner.toggleTorch();
  };

  isTorchEnabled = async () => {
    const { enabled } = await BarcodeScanner.isTorchEnabled();
    return enabled;
  };

  isTorchAvailable = async () => {
    const { available } = await BarcodeScanner.isTorchAvailable();
    return available;
  };

  setZoomRatio = async () => {
    await BarcodeScanner.setZoomRatio({ zoomRatio: 0.5 });
  };

  getZoomRatio = async () => {
    const { zoomRatio } = await BarcodeScanner.getZoomRatio();
    return zoomRatio;
  };

  getMinZoomRatio = async () => {
    const { zoomRatio } = await BarcodeScanner.getMinZoomRatio();
    return zoomRatio;
  };

  getMaxZoomRatio = async () => {
    const { zoomRatio } = await BarcodeScanner.getMaxZoomRatio();
    return zoomRatio;
  };

  openSettings = async () => {
    await BarcodeScanner.openSettings();
  };

  isGoogleBarcodeScannerModuleAvailable = async () => {
    const { available } =
      await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    return available;
  };

  installGoogleBarcodeScannerModule = async () => {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  };

  checkPermissions = async () => {
    const { camera } = await BarcodeScanner.checkPermissions();
    return camera;
  };

  requestPermissions = async () => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera;
  };

}
