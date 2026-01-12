# Dockerfile for building PDFium WASM with font support
# Builds two variants:
#   - pdfium-full.wasm: With Noto CJK fonts embedded
#   - pdfium-lite.wasm: Without fonts (FS API enabled for runtime font loading)

FROM ubuntu:22.04

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    curl \
    wget \
    xz-utils \
    pkg-config \
    ninja-build \
    lsb-release \
    sudo \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install depot_tools
RUN git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git /opt/depot_tools
ENV PATH="/opt/depot_tools:${PATH}"

# Install Emscripten
WORKDIR /opt
RUN git clone https://github.com/emscripten-core/emsdk.git
WORKDIR /opt/emsdk
RUN ./emsdk install 3.1.51 && \
    ./emsdk activate 3.1.51

# Set up Emscripten environment
ENV EMSDK=/opt/emsdk
ENV PATH="/opt/emsdk:/opt/emsdk/upstream/emscripten:${PATH}"

# Download Noto Sans CJK fonts for embedding
WORKDIR /fonts
RUN curl -L -o NotoSansCJK.zip \
    "https://github.com/notofonts/noto-cjk/releases/download/Sans2.004/03_NotoSansCJK-OTC.zip" && \
    unzip NotoSansCJK.zip -d /fonts/noto-cjk && \
    rm NotoSansCJK.zip

# Create font directory structure for PDFium
RUN mkdir -p /embed-fonts && \
    cp /fonts/noto-cjk/OTC/NotoSansCJK-Regular.ttc /embed-fonts/

WORKDIR /build

# Copy build scripts
COPY build.py /build/
COPY config.py /build/

# Output directory
VOLUME ["/output"]

# Entry point
CMD ["python3", "/build/build.py", "--output-dir", "/output"]
