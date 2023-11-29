---
title: "Clustering Proxmox with only 2 nodes"
date: 2023-11-29
summary: How to setup a Proxmox cluster running with only 2 nodes
tags: ['linux', 'selfhosted', 'proxmox']
featuredCredits: '<a href="https://unsplash.com/@jainath" target="_blank">Jainath Ponnala</a>'
---

A while ago I got a Lenovo P330 Tiny that I decided to use as part of my **k3s** cluster but I ran into a problem with Proxmox. Normally you need at least 3 nodes in order to create a cluster due to the [quorum requirements](https://pve.proxmox.com/wiki/Cluster_Manager#_quorum), but I did not have 3 nodes, so I looked around a bit and found out that you *can* run a Proxmox cluster with less nodes but there is a catch.

# Corosync
Proxmox uses [Corosync Cluster Engine](https://corosync.github.io/corosync/) to maintain a quorum which decides how configuration is being keept in sync across all the nodes.

For example, we have 3 nodes in a cluster, one of them crashes, this results in corosync kicking in and checking if it still has quorum in order to remember next time when the crashed node
comes back online to sync the configuration only for that one.

What does this have to do with creating a cluster with only 2 nodes? Well, we have to decide on a node which is going to have **2 votes** in the quorum in order for the cluster to still work with only one node running
in case of maintenance or malfunctions.

# Changing the config
First of all, read about how the `corosync.conf` file is propagated in the cluster [here](https://pve.proxmox.com/pve-docs/pve-admin-guide.html#_corosync_configuration). Specifically this part:

> The configuration will get updated automatically, as soon as the file changes. This means that changes which can be integrated in a running corosync will take effect immediately.

This means that we should create a copy of the file that will be edited in order to avoid mistakes getting saved and served to all nodes.

```bash
cp /etc/pve/corosync.conf /etc/pve/corosync.new.conf
```

Now change the `quorum_votes` value to 2 for the node you want to be able to still work on it's own.

{{< highlight html "linenos=table,hl_lines=11" >}}
nodelist {
  node {
    name: delta
    nodeid: 2
    quorum_votes: 1
    ring0_addr: 192.168.0.206
  }
  node {
    name: epsilon
    nodeid: 1
    quorum_votes: 2
    ring0_addr: 192.168.0.201
  }
}
{{< /highlight >}}

Once that's done, also increase the `config_version` value in order to trigger a sync instantly to all nodes.

{{< highlight html "linenos=table,hl_lines=3" >}}
totem {
  cluster_name: homelab
  config_version: 5
  interface {
    linknumber: 0
  }
  ip_version: ipv4-6
  link_mode: passive
  secauth: on
  version: 2
}
{{< /highlight >}}

Save your changes and replace the existing config, maybe also create a backup of the existing file to restore in case of problems.

```bash
mv /etc/pve/corosync.conf /etc/pve/corosync.conf.bak
mv /etc/pve/corosync.new.conf /etc/pve/corosync.conf
```

# Test your changes
Reboot each of the nodes while checking the status of the cluster under `Datacenter > Cluster`, if everything goes well you should not see any problems.

If for some reason the quorum does not happen then the entire cluster will go into **read-only state**, to temporarily solve this and allow your to check why it happens, you can reduce the number of nodes required
for quorum down to 1 using `pvecm expected 1`.
