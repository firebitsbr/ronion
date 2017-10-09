// Generated by LiveScript 1.5.0
/**
 * @package   Ronion
 * @author    Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright Copyright (c) 2017, Nazar Mokrynskyi
 * @license   MIT License, see license.txt
 */
(function(){
  var lib, randombytes, test, nodes, received_data, i$, len$;
  lib = require('..');
  randombytes = require('crypto').randomBytes;
  test = require('tape');
  function encrypt(plaintext, arg$){
    var key, mac, ciphertext, x$, encrypted;
    key = arg$[0];
    mac = 0;
    ciphertext = plaintext.map(function(character){
      mac += character;
      return character ^ key;
    });
    mac = mac % 256;
    x$ = encrypted = new Uint8Array(plaintext.length + 1);
    x$.set(ciphertext);
    x$.set([mac], ciphertext.length);
    return Promise.resolve(encrypted);
  }
  function decrypt(encrypted, arg$){
    var key, mac, plaintext;
    key = arg$[0];
    mac = 0;
    plaintext = encrypted.subarray(0, encrypted.length - 1).map(function(character){
      character = character ^ key;
      mac += character;
      return character;
    });
    mac = mac % 256;
    if (mac !== encrypted[encrypted.length - 1]) {
      return Promise.reject();
    } else {
      return Promise.resolve(plaintext);
    }
  }
  function generate_key(){
    var key;
    do {
      key = randombytes(1);
    } while (key[0] === 0);
    return key;
  }
  function compute_source_id(address, segment_id){
    return address.join('') + segment_id.join('');
  }
  nodes = [new lib(1, 512, 1, 1), new lib(1, 512, 1, 1), new lib(1, 512, 1, 1)];
  for (i$ = 0, len$ = nodes.length; i$ < len$; ++i$) {
    (fn$.call(this, i$, nodes[i$]));
  }
  test('Ronion', function(t){
    var node_0, node_1, node_2;
    t.equal(nodes[0].get_max_command_data_length(), 505, 'Max command data length computed correctly');
    node_0 = nodes[0];
    node_1 = nodes[1];
    node_2 = nodes[2];
    t.test('Create routing path (first segment)', function(t){
      var key, segment_id, source_id;
      t.plan(10);
      node_1.once('create_request', function(arg$){
        var command_data;
        command_data = arg$.command_data;
        t.equal(command_data.join(''), key.join(''), 'Create request works');
      });
      node_0.once('create_response', function(arg$){
        var command_data, source_id_0, source_id_1, key, source_id;
        command_data = arg$.command_data;
        t.equal(command_data.length, 1, 'Create response works');
        source_id_0 = compute_source_id(node_0._address, segment_id);
        source_id_1 = compute_source_id(node_1._address, node_1._in_segment_id);
        t.equal(node_0[source_id_1]._local_encryption_key.join(''), node_1[source_id_0]._remote_encryption_key.join(''), 'Encryption keys established #1');
        t.equal(node_1[source_id_0]._local_encryption_key.join(''), node_0[source_id_1]._remote_encryption_key.join(''), 'Encryption keys established #2');
        node_2.once('create_request', function(arg$){
          var command_data;
          command_data = arg$.command_data;
          t.equal(command_data.join(''), key.join(''), 'Extend request works and create request was called');
        });
        node_0.once('extend_response', function(arg$){
          var command_data, source_id_0, source_id_2, data;
          command_data = arg$.command_data;
          t.equal(command_data.length, 1, 'Extend response works');
          source_id_0 = compute_source_id(node_1._address, segment_id);
          source_id_2 = compute_source_id(node_2._address, node_2._in_segment_id);
          t.equal(node_0[source_id_2]._local_encryption_key.join(''), node_2[source_id_0]._remote_encryption_key.join(''), 'Encryption keys established #3');
          t.equal(node_2[source_id_0]._local_encryption_key.join(''), node_0[source_id_2]._remote_encryption_key.join(''), 'Encryption keys established #4');
          data = randombytes(30);
          node_1.once('data', function(arg$){
            var command_data, data2;
            command_data = arg$.command_data;
            t.equal(command_data.join(''), data.join(''), 'Command data received fine #1');
            data2 = randombytes(30);
            node_2.once('data', function(arg$){
              var command_data;
              command_data = arg$.command_data;
              t.equal(command_data.join(''), data2.join(''), 'Command data received fine #2');
            });
            node_0.data(node_1._address, segment_id, node_2._address, data2);
          });
          node_0.data(node_1._address, segment_id, node_1._address, data);
        });
        key = generate_key();
        source_id = compute_source_id(node_2._address, segment_id);
        node_0[source_id] = {
          _local_encryption_key: key
        };
        node_0.extend_request(node_1._address, segment_id, node_2._address, key);
      });
      key = generate_key();
      segment_id = node_0.create_request(node_1._address, key);
      source_id = compute_source_id(node_1._address, segment_id);
      node_0[source_id] = {
        _local_encryption_key: key
      };
    });
    t.end();
  });
  function fn$(source_address, node){
    node._address = Uint8Array.of(source_address);
    node.on('send', function(arg$){
      var address, packet;
      address = arg$.address, packet = arg$.packet;
      nodes[address].process_packet(node._address, packet);
    });
    node.on('create_request', function(arg$){
      var address, segment_id, command_data, source_id;
      address = arg$.address, segment_id = arg$.segment_id, command_data = arg$.command_data;
      if (command_data.length === 1) {
        node._in_segment_id = segment_id;
        source_id = compute_source_id(address, segment_id);
        node[source_id] = {
          _remote_encryption_key: command_data,
          _local_encryption_key: generate_key()
        };
        node.create_response(address, segment_id, node[source_id]._local_encryption_key);
        node.confirm_incoming_segment_established(address, segment_id);
      }
    });
    node.on('create_response', function(arg$){
      var address, segment_id, command_data, source_id;
      address = arg$.address, segment_id = arg$.segment_id, command_data = arg$.command_data;
      if (command_data.length === 1) {
        source_id = compute_source_id(address, segment_id);
        node[source_id]._remote_encryption_key = command_data;
        node.confirm_outgoing_segment_established(address, segment_id);
      }
    });
    node.on('extend_response', function(arg$){
      var address, segment_id, command_data, source_id, target_address, target_source_id;
      address = arg$.address, segment_id = arg$.segment_id, command_data = arg$.command_data;
      if (command_data.length === 1) {
        source_id = compute_source_id(address, segment_id);
        target_address = node._pending_extensions.get(source_id);
        target_source_id = compute_source_id(target_address, segment_id);
        node[target_source_id]._remote_encryption_key = command_data;
        node.confirm_extended_path(address, segment_id);
      }
    });
    node.on('destroy', function(arg$){
      var address, segment_id, source_id;
      address = arg$.address, segment_id = arg$.segment_id;
      source_id = compute_source_id(address, segment_id);
      delete node[source_id]._remote_encryption_key;
      delete node[source_id]._local_encryption_key;
    });
    node.on('data', function(arg$){
      var address, segment_id, command_data;
      address = arg$.address, segment_id = arg$.segment_id, command_data = arg$.command_data;
      received_data = command_data;
    });
    node.on('encrypt', function(data){
      var address, segment_id, target_address, plaintext, source_id;
      address = data.address, segment_id = data.segment_id, target_address = data.target_address, plaintext = data.plaintext;
      source_id = compute_source_id(target_address, segment_id);
      return encrypt(plaintext, node[source_id]._remote_encryption_key).then(function(ciphertext){
        data.ciphertext = ciphertext;
      });
    });
    node.on('decrypt', function(data){
      var address, segment_id, target_address, ciphertext, source_id;
      address = data.address, segment_id = data.segment_id, target_address = data.target_address, ciphertext = data.ciphertext;
      source_id = compute_source_id(target_address, segment_id);
      return decrypt(ciphertext, node[source_id]._local_encryption_key).then(function(plaintext){
        data.plaintext = plaintext;
      });
    });
    node.on('wrap', function(data){
      return data.wrapped = data.unwrapped.slice();
    });
    node.on('unwrap', function(data){
      return data.unwrapped = data.wrapped.slice();
    });
  }
}).call(this);
