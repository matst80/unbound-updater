FROM mvance/unbound:latest

RUN apt update && apt install -y --no-install-recommends nodejs

ENV NAME=homenet \
    VERSION=0.1 \
    SUMMARY="${NAME} dns and webproxy." \
    DESCRIPTION="${NAME} dns and webproxy." \
    REDIS_HOST="10.10.11.128"
    REDIS_DB=1
    CONFIG_KEY="dns"
    FILE="/opt/unbound/etc/unbound/unbound.conf"

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 53/tcp
EXPOSE 53/udp

ENV PATH /opt/unbound/sbin:"$PATH"

CMD [ "node", "index.js" ]