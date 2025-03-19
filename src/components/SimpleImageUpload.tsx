"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
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
};

const SimpleImageUpload = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const inviteRef = useRef<HTMLDivElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Detect iOS devices on component mount
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    setIsIOS(checkIsIOS());
  }, []);

  // Pre-render the template image when the component mounts
  useEffect(() => {
    const templateImg = document.createElement("img");
    templateImg.crossOrigin = "anonymous";
    templateImg.src = TEMPLATE_CONFIG.templateImagePath;
    templateImg.onload = () => {
      // The template is loaded and ready
    };
  }, []);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUserImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Helper function to create a custom rendition of the invitation
  const createCustomRendition = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a canvas element
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Set canvas dimensions to match our invitation
        canvas.width = 1000;
        canvas.height = 1333; // 4:3 aspect ratio

        // Load the template image
        const templateImg = document.createElement("img");
        templateImg.crossOrigin = "anonymous";
        templateImg.src = TEMPLATE_CONFIG.templateImagePath;

        templateImg.onload = () => {
          // Draw template background
          ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

          // If user has uploaded an image, draw it in the correct position
          if (userImage) {
            const userImg = document.createElement("img");
            userImg.crossOrigin = "anonymous";
            userImg.src = userImage;

            userImg.onload = () => {
              // Calculate position and dimensions based on percentages
              const top =
                (parseFloat(TEMPLATE_CONFIG.userImagePosition.top) / 100) *
                canvas.height;
              const left =
                (parseFloat(TEMPLATE_CONFIG.userImagePosition.left) / 100) *
                canvas.width;
              const width =
                (parseFloat(TEMPLATE_CONFIG.userImagePosition.width) / 100) *
                canvas.width;
              const height =
                (parseFloat(TEMPLATE_CONFIG.userImagePosition.height) / 100) *
                canvas.height;

              // Draw user image centered at the specified position
              ctx.save();

              // Create clipping region for the shape
              ctx.beginPath();
              const shape = TEMPLATE_CONFIG.userImagePosition.shape;
              if (shape === "circle") {
                const radius = Math.min(width, height) / 2;
                ctx.arc(left, top, radius, 0, Math.PI * 2);
              } else if (shape === "square" || shape === "rectangle") {
                // Draw rounded rectangle
                const cornerRadius = shape === "square" ? 10 : 5;
                const x = left - width / 2;
                const y = top - height / 2;

                ctx.moveTo(x + cornerRadius, y);
                ctx.lineTo(x + width - cornerRadius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
                ctx.lineTo(x + width, y + height - cornerRadius);
                ctx.quadraticCurveTo(
                  x + width,
                  y + height,
                  x + width - cornerRadius,
                  y + height
                );
                ctx.lineTo(x + cornerRadius, y + height);
                ctx.quadraticCurveTo(
                  x,
                  y + height,
                  x,
                  y + height - cornerRadius
                );
                ctx.lineTo(x, y + cornerRadius);
                ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
              }
              ctx.closePath();
              ctx.clip();

              // Draw user image
              ctx.drawImage(
                userImg,
                left - width / 2,
                top - height / 2,
                width,
                height
              );

              // Add border if specified
              if (TEMPLATE_CONFIG.userImagePosition.borderWidth > 0) {
                ctx.strokeStyle = TEMPLATE_CONFIG.userImagePosition.borderColor;
                ctx.lineWidth = TEMPLATE_CONFIG.userImagePosition.borderWidth;
                if (shape === "circle") {
                  const radius = Math.min(width, height) / 2;
                  ctx.arc(left, top, radius, 0, Math.PI * 2);
                } else {
                  const x = left - width / 2;
                  const y = top - height / 2;
                  ctx.strokeRect(x, y, width, height);
                }
                ctx.stroke();
              }

              ctx.restore();

              // Return the final data URL
              const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
              resolve(dataUrl);
            };

            userImg.onerror = () => {
              reject(new Error("Failed to load user image"));
            };
          } else {
            // No user image, just return the template
            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            resolve(dataUrl);
          }
        };

        templateImg.onerror = () => {
          reject(new Error("Failed to load template image"));
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  const attemptAutomaticDownload = (dataUrl: string, filename: string) => {
    try {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);

      // Attempt to trigger the download
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      return true;
    } catch (error) {
      console.error("Error initiating download:", error);
      return false;
    }
  };

  const downloadInvite = async () => {
    if (!userImage) return;

    try {
      setIsDownloading(true);

      // Generate a custom rendition of the invitation
      const dataUrl = await createCustomRendition();

      // Try automatic download for all devices - don't store the result
      attemptAutomaticDownload(dataUrl, "e-invite.jpeg");

      // If on iOS, also show a modal with an explicit download button
      if (isIOS) {
        // Create a blob object from the data URL
        const parts = dataUrl.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
        const binaryString = atob(parts[1]);
        const array = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          array[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([array], { type: mime });
        const blobUrl = URL.createObjectURL(blob);

        // Update download link with the blob URL
        if (downloadLinkRef.current) {
          downloadLinkRef.current.href = blobUrl;
          downloadLinkRef.current.style.display = "block";
        }

        // Fallback for iOS: If automatic download seems to have failed, show a modal or dialog
        const downloadModal = document.createElement("div");
        downloadModal.style.position = "fixed";
        downloadModal.style.top = "0";
        downloadModal.style.left = "0";
        downloadModal.style.width = "100%";
        downloadModal.style.height = "100%";
        downloadModal.style.backgroundColor = "rgba(0,0,0,0.75)";
        downloadModal.style.display = "flex";
        downloadModal.style.flexDirection = "column";
        downloadModal.style.alignItems = "center";
        downloadModal.style.justifyContent = "center";
        downloadModal.style.zIndex = "9999";
        downloadModal.style.fontFamily =
          "-apple-system, BlinkMacSystemFont, sans-serif";

        // Create the modal content
        downloadModal.innerHTML = `
          <div style="background: white; max-width: 90%; width: 350px; padding: 20px; border-radius: 12px; text-align: center;">
            <h3 style="margin-top: 0; font-size: 18px; color: #333;">Your invitation is ready!</h3>
            <img src="${dataUrl}" alt="Your invitation" style="max-width: 100%; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              Tap the button below to save your invitation to your device.
            </p>
            <a href="${blobUrl}" download="e-invite.jpeg" style="display: block; background: #0066ff; color: white; padding: 12px 0; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px;">
              Download Invitation
            </a>
            <button style="background: none; border: none; margin-top: 15px; color: #666; font-size: 14px;" onclick="this.parentNode.parentNode.remove()">
              Close
            </button>
          </div>
        `;

        // Add click event to close when clicking outside the modal
        downloadModal.addEventListener("click", (e) => {
          if (e.target === downloadModal) {
            downloadModal.remove();
          }
        });

        // Add the modal to the body
        document.body.appendChild(downloadModal);
      }
    } catch (error) {
      console.error("Error generating invite:", error);
      alert("There was an error generating your invitation. Please try again.");
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

          {/* Hidden download link for fallback */}
          <a
            ref={downloadLinkRef}
            download="e-invite.jpeg"
            className="hidden"
            style={{ display: "none" }}
          >
            Download again
          </a>
        </div>

        <div className="w-full md:w-2/3 text-black">
          {/* <h2 className="text-xl font-semibold mb-4 text-black">Preview</h2> */}
          <div
            ref={inviteRef}
            className="relative w-full border-2 border-white aspect-[3/4] rounded-lg shadow-lg overflow-hidden"
          >
            {/* Template Background - Using the default template image */}
            <Image
              src={TEMPLATE_CONFIG.templateImagePath}
              alt="Template"
              className="absolute inset-0 w-full h-full object-cover"
              width={1000}
              height={1333}
              priority
              unoptimized
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
                  src={userImage}
                  alt="User"
                  className="w-full h-full object-cover"
                  width={500}
                  height={500}
                  unoptimized
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
        </div>
      </div>
    </div>
  );
};

export default SimpleImageUpload;
