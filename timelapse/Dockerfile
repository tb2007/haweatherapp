FROM alpine:3.20
RUN apk add --no-cache ffmpeg curl bash tzdata
COPY capture.sh /capture.sh
RUN chmod +x /capture.sh
CMD ["/capture.sh"]
