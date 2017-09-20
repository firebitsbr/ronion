// Generated by LiveScript 1.5.0
/**
 * @package   Ronion
 * @author    Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright Copyright (c) 2017, Nazar Mokrynskyi
 * @license   MIT License, see license.txt
 */
(function(){
  module.exports = {
    Router: Router,
    Circuit: Circuit
  };
  /**
   * @param {Uint8Array} array
   *
   * @return {string}
   */
  function to_string(array){
    return array.join('');
  }
  /**
   * @constructor
   */
  function Router(){
    if (!(this instanceof Router)) {
      return new Router;
    }
    this.connections = {};
  }
  Router.prototype = {
    /**
     * @param {Connection} connection
     */
    add_connection: function(connection){
      var address;
      address = to_string(connection.address);
      this.connections[address] = connection.on('data', function(){}).on('close', this.remove_connection.bind(this, connection));
    }
    /**
     * @param {(Connection|Uint8Array)} address_or_connection
     */,
    remove_connection: function(address_or_connection){
      var address, key, ref$, value;
      if (address_or_connection instanceof Uint8Array && in$(to_string(address_or_connection), this.connections)) {
        address = to_string(address_or_connection);
      } else {
        for (key in ref$ = this.connections) {
          value = ref$[key];
          if (value === address_or_connection) {
            address = key;
          }
        }
        if (!address) {
          throw new Error('Address or connection not found');
        }
      }
      delete this.connections[address].onreceive;
      delete this.connections[address].onclose;
      delete this.connections[address];
    }
  };
  Object.defineProperty(Router.prototype, 'constructor', {
    enumerable: false,
    value: Router
  });
  /**
   * @constructor
   *
   * @param {Connection}		entry_node_connection	Connection of the node where circuit starts
   * @param {Uint8Array[]}	hops_addresses			Addresses of nodes after entry_node_connection to extend circuit through
   * @param {number}			[max_hops]				Only useful if you want hide the actual number of hops from those who observe length of the packet
   */
  function Circuit(entry_node_connection, hops_addresses, max_hops){
    max_hops == null && (max_hops = hops_addresses.length + 1);
    if (!(this instanceof Circuit)) {
      return new Circuit(entry_node_connection, hops_addresses, max_hops);
    }
    if (max_hops < hops_addresses.length + 1) {
      throw new Error('Incorrect max_hops, should be more');
    }
  }
  Circuit.prototype = {
    destroy: function(){}
  };
  Object.defineProperty(Circuit.prototype, 'constructor', {
    enumerable: false,
    value: Circuit
  });
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);
