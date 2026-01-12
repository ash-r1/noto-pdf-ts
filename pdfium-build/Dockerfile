# Dockerfile for PDFium WASM
# Downloads pre-built WASM from paulocoutinhox/pdfium-lib

FROM ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install minimal dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy build script
COPY build.sh /build/
RUN chmod +x /build/build.sh

# Output directory
VOLUME ["/output"]

# Entry point
CMD ["/build/build.sh", "--output-dir", "/output"]
