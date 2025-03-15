"use client";

import { useState, useRef, type ChangeEvent } from "react";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";
import Image from "next/image";

// You can adjust these settings to match your specific template design
const TEMPLATE_CONFIG = {
  // The path to your template image in the public folder
  templateImagePath: "/layout.png",

  // Position and size of the user's image on the template
  userImagePosition: {
    top: "39%", // vertical position from the top (as percentage)
    left: "50%", // horizontal position from the left (as percentage)
    width: "54%", // width of the user image (as percentage)
    height: "39.3%", // height of the user image (as percentage)
    shape: "square", // 'circle', 'square', or 'rectangle'
    borderColor: "white", // color of the border around the user image
    borderWidth: 2, // width of the border in pixels
  },

  // Mobile optimization settings
  mobileOptimization: {
    maxWidth: 1200, // Maximum width for mobile devices in pixels
    quality: 0.9, // Image quality (0-1)
    format: "jpeg", // Output format (jpeg or png)
    fileName: "personal-invitation", // Base filename without extension
  },
};

const SimpleImageUpload = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const inviteRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size - limit to 5MB as mentioned in UI
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      alert("File is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUserImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const downloadInvite = async () => {
    if (!inviteRef.current) return;

    try {
      setIsDownloading(true);

      // Get current date for unique filename
      const date = new Date();
      const dateString = `${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
      const fileName = `${TEMPLATE_CONFIG.mobileOptimization.fileName}-${dateString}.${TEMPLATE_CONFIG.mobileOptimization.format}`;

      // Detect iOS devices - needs special handling
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Special settings for iOS
      const options = {
        quality: isIOS ? 0.8 : TEMPLATE_CONFIG.mobileOptimization.quality, // Slightly lower quality for iOS to reduce memory usage
        pixelRatio: isMobile ? (isIOS ? 1.5 : 2) : 1, // Lower pixelRatio for iOS to prevent memory issues
        width: isMobile
          ? Math.min(
              window.innerWidth * (isIOS ? 1.5 : 2),
              isIOS ? 1000 : TEMPLATE_CONFIG.mobileOptimization.maxWidth
            )
          : Math.min(
              inviteRef.current.offsetWidth,
              TEMPLATE_CONFIG.mobileOptimization.maxWidth
            ),
        style: {
          background: "white",
        },
        // iOS Safari has issues with some advanced options, so keep it simple for iOS
        skipAutoScale: isIOS,
        canvasWidth: isIOS
          ? Math.min(window.innerWidth * 1.5, 1000)
          : undefined,
      };

      // Generate the image based on device type
      let dataUrl;

      // For iOS, use a different approach
      if (isIOS) {
        try {
          // iOS works better with PNG
          dataUrl = await htmlToImage.toPng(inviteRef.current, options);

          // Create a temporary link element
          const link = document.createElement("a");
          link.href = dataUrl;

          // For iOS Safari, we need to use a different approach
          if (isSafari) {
            // Open image in new tab for Safari
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            alert(
              "After clicking OK, your image will open in a new tab. Tap and hold the image, then select 'Add to Photos' to save it."
            );
            link.click();
          } else {
            // For iOS but non-Safari browsers
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }

          setIsDownloading(false);
          return;
        } catch (iosError) {
          console.error("iOS-specific error:", iosError);
          // Fall back to regular method if iOS-specific approach fails
        }
      }

      // Standard approach for non-iOS devices
      if (TEMPLATE_CONFIG.mobileOptimization.format === "png") {
        dataUrl = await htmlToImage.toPng(inviteRef.current, options);
      } else {
        dataUrl = await htmlToImage.toJpeg(inviteRef.current, options);
      }

      // For iOS devices that failed the iOS-specific approach
      if (isIOS) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        alert(
          "After clicking OK, your image will open in a new tab. Tap and hold the image, then select 'Add to Photos' to save it."
        );
        link.click();
      } else {
        // Save the file using file-saver for non-iOS devices
        saveAs(dataUrl, fileName);
      }
    } catch (error) {
      console.error("Error generating invite:", error);
      alert("There was a problem creating your invitation. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine the CSS class for the shape
  const getShapeClass = () => {
    const { shape } = TEMPLATE_CONFIG.userImagePosition;
    switch (shape) {
      case "circle":
        return "rounded-full";
      case "square":
        return "rounded-lg";
      case "rectangle":
        return "rounded-md";
      default:
        return "rounded-full";
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 !text-black">
      {/* <h1 className="text-3xl font-bold mb-6 text-black">
        Apostolic Summit 2025
      </h1> */}

      <div className="flex w-full flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Upload Your Image
          </h2>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500 ">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 ">
                PNG, JPG or JPEG (MAX. 5MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>

          <button
            onClick={downloadInvite}
            disabled={!userImage || isDownloading}
            className="w-full mt-6 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isDownloading ? "Generating..." : "Download Your Invite"}
          </button>
        </div>

        <div className="w-full md:w-2/3 text-black">
          {/* <h2 className="text-xl font-semibold mb-4 text-black">Preview</h2> */}
          <div
            ref={inviteRef}
            className="relative w-full border-2 border-white aspect-[3/4] rounded-lg shadow-lg overflow-hidden"
          >
            {/* Template Background - Using the default template image */}
            <Image
              src={TEMPLATE_CONFIG.templateImagePath || "/placeholder.svg"}
              alt="Template"
              className="absolute inset-0 w-full h-full object-cover"
              width={1000}
              height={1000}
            />

            {/* User Image */}
            <div
              className={`absolute overflow-hidden ${getShapeClass()} shadow-lg`}
              style={{
                top: TEMPLATE_CONFIG.userImagePosition.top,
                left: TEMPLATE_CONFIG.userImagePosition.left,
                width: TEMPLATE_CONFIG.userImagePosition.width,
                height: TEMPLATE_CONFIG.userImagePosition.height,
                borderWidth: TEMPLATE_CONFIG.userImagePosition.borderWidth,
                borderColor: TEMPLATE_CONFIG.userImagePosition.borderColor,
                borderStyle: "solid",
                transform: "translate(-50%, -50%)",
              }}
            >
              {userImage ? (
                <Image
                  src={userImage || "/placeholder.svg"}
                  alt="User"
                  className="w-full h-full object-cover"
                  width={1000}
                  height={1000}
                />
              ) : (
                <div className="w-full h-full bg-white/30 flex items-center justify-center">
                  <p className="text-white text-center px-4 font-medium">
                    Upload your photo
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-black mt-2 text-center">
            Upload your photo and click download to get your custom invitation
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleImageUpload;
