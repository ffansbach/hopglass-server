/*  Copyright (C) 2018 Wolfgang Rosenauer
    Copyright (C) 2016 HopGlass Server contributors

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>. */

'use strict'

var async = require('async')
var _ = require('lodash')

module.exports = function(receiver, config) {

  function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
  }

  // get all contact data
  function getContacts(stream, query) {
    stream.writeHead(200, { 'Content-Type': 'text/plain' })
    var data = receiver.getData(query)
    var contacts = []

    async.forEachOf(data, function(n, k, finished) {
      if (_.has(n, 'nodeinfo.owner'))
        contacts.push(_.get(n, 'nodeinfo.owner.contact', 'unknown'))
      finished()
    }, function() {
      var list = uniq(contacts)
      for (var i in list)
        stream.write(list[i] + '\n')
      stream.end()
    })
  }

  // get all contact data for nodes without location set
  function getNoLocationContacts(stream, query) {
    stream.writeHead(200, { 'Content-Type': 'text/plain' })
    var data = receiver.getData(query)
    var contacts = []

    async.forEachOf(data, function(n, k, finished) {
      if (!_.has(n, 'nodeinfo.location')) {
        if (_.has(n, 'nodeinfo.owner'))
          contacts.push(_.get(n, 'nodeinfo.owner.contact', 'unknown'))
      }
      finished()
    }, function() {
      var list = uniq(contacts)
      for (var i in list)
        stream.write(list[i] + '\n')
      stream.end()
    })
  }

  // get all node names for a certain contact address
  function getNodes(stream, query) {
    stream.writeHead(200, { 'Content-Type': 'text/plain' })
    var data = receiver.getData(query)
    var nodes = []

    async.forEachOf(data, function(n, k, finished) {
      nodes.push(_.get(n, 'nodeinfo.hostname')+";"+_.get(n, 'nodeinfo.node_id'))
      finished()
    }, function() {
      for (var i in nodes)
        stream.write(nodes[i] + '\n')
      stream.end()
    })
  }

  return {
    /* eslint-disable quotes */
    "contacts": getContacts,
    "noloc-contacts": getNoLocationContacts,
    "nodes": getNodes
  }
}
