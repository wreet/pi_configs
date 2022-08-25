#!/bin/bash

# set charon.install_virtual_ip = no to prevent the daemon from also installing the VIP

set -o nounset
set -o errexit

# decron it 
echo "[i] VTI if: vti${PLUTO_UNIQUEID}"
echo "[i] PLUTO_ME: ${PLUTO_ME}"
echo "[i] PLUTO_MY_SOURCEIP: ${PLUTO_MY_SOURCEIP}"
echo "[i] PLUTO_PEER: ${PLUTO_PEER}"
echo "[i] PLUTO_MARK_OUT: ${PLUTO_MARK_OUT}"
echo "[i] PLUTO_PEER_CLIENT: ${PLUTO_PEER_CLIENT}"

VTI_IF="vti${PLUTO_UNIQUEID}"

case "${PLUTO_VERB}" in
    up-client)
        ip tunnel add "${VTI_IF}" local "${PLUTO_ME}" remote "${PLUTO_PEER}" mode vti \
        	key "${PLUTO_MARK_OUT%%/*}"
        ip link set "${VTI_IF}" up
	ip addr add "${PLUTO_MY_SOURCEIP}" dev "${VTI_IF}"
	#ip route add "${PLUTO_PEER_SOURCE_IP}" dev "${VTI_IF}"
	ip route add 10.0.1.0/24 dev "${VTI_IF}" # use your VPN client range
        sysctl -w "net.ipv4.conf.${VTI_IF}.disable_policy=1"
	#ip r add "${PLUTO_PEER_CLIENT}" dev "${VTI_IF}"
	;;
    down-client)
        ip tunnel del "${VTI_IF}"
        ;;
esac
