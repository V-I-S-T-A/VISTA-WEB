const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

function imageFileToJpeg(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(
        async (blob) => {
          if (!blob)
            return reject(new Error(`Could not convert ${file.name}.`));
          try {
            resolve({
              bytes: new Uint8Array(await blob.arrayBuffer()),
              width: canvas.width,
              height: canvas.height,
            });
          } catch {
            reject(
              new Error(`Could not read the converted image ${file.name}.`),
            );
          }
        },
        "image/jpeg",
        0.92,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not read ${file.name}.`));
    };
    image.src = objectUrl;
  });
}

function encode(text) {
  return new TextEncoder().encode(text);
}

function joinBytes(parts) {
  const result = new Uint8Array(
    parts.reduce((size, part) => size + part.length, 0),
  );
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
}

export async function imagesToPdf(files, outputName = "Scanned_Documents.pdf") {
  if (!files.length) throw new Error("Choose at least one image to convert.");

  const images = await Promise.all(files.map(imageFileToJpeg));
  const pageCount = images.length;
  const objectCount = 2 + pageCount * 3;
  const objects = new Array(objectCount + 1);
  const kids = images.map((_, index) => `${3 + index * 3} 0 R`).join(" ");
  objects[1] = encode("<< /Type /Catalog /Pages 2 0 R >>");
  objects[2] = encode(`<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`);

  images.forEach((image, index) => {
    const pageId = 3 + index * 3;
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const scale = Math.min(
      PAGE_WIDTH / image.width,
      PAGE_HEIGHT / image.height,
    );
    const width = image.width * scale;
    const height = image.height * scale;
    const x = (PAGE_WIDTH - width) / 2;
    const y = (PAGE_HEIGHT - height) / 2;
    const content = encode(
      `q\n${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im${index + 1} Do\nQ\n`,
    );

    objects[pageId] = encode(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /XObject << /Im${index + 1} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    objects[contentId] = joinBytes([
      encode(`<< /Length ${content.length} >>\nstream\n`),
      content,
      encode("endstream"),
    ]);
    objects[imageId] = joinBytes([
      encode(
        `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`,
      ),
      image.bytes,
      encode("\nendstream"),
    ]);
  });

  const chunks = [encode("%PDF-1.4\n")];
  const offsets = new Array(objectCount + 1).fill(0);
  let byteLength = chunks[0].length;
  for (let id = 1; id <= objectCount; id += 1) {
    const objectChunk = joinBytes([
      encode(`${id} 0 obj\n`),
      objects[id],
      encode("\nendobj\n"),
    ]);
    offsets[id] = byteLength;
    chunks.push(objectChunk);
    byteLength += objectChunk.length;
  }

  const xrefOffset = byteLength;
  let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= objectCount; id += 1) {
    xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  chunks.push(
    encode(
      `${xref}trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
    ),
  );

  return new File([joinBytes(chunks)], outputName, { type: "application/pdf" });
}
