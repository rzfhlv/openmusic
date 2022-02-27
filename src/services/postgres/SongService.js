/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils/song');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song failed to add');
    }

    return result.rows[0].id;
  }

  async getSongs(params) {
    let qStr = '';
    const vPop = [];

    const keys = Object.keys(params);
    keys.forEach((key, index) => {
      index++;
      if (index === 1) {
        qStr += ' WHERE';
      } else {
        qStr += ' AND';
      }
      qStr += ` ${key} ILIKE $${index}`;
      vPop.push(`%${params[key]}%`);
    });

    if (keys.length) {
      const query = {
        text: `SELECT id, title, performer FROM songs${qStr}`,
        values: vPop,
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('Song not found');
      }

      return result.rows;
    }
    const result = await this._pool.query('SELECT id, title, performer FROM songs');
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editSongById(id, payload) {
    const updatedAt = new Date().toISOString();
    let qStr = '';
    const vPop = [];

    let total = 0;
    const keys = Object.keys(payload);
    keys.forEach((key, index) => {
      index++;
      if (key === 'albumId') {
        key = 'album_id';
        vPop.push(payload.albumId);
      } else {
        vPop.push(payload[key]);
      }
      qStr += ` ${key} = $${index},`;
      total = index;
    });
    total++;

    qStr += ` updated_at = $${total}`;
    total++;
    qStr += ` WHERE id = $${total}`;

    vPop.push(updatedAt);
    vPop.push(id);

    const query = {
      text: `UPDATE songs SET${qStr} RETURNING id`,
      values: vPop,
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song failed to update. Id not found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song failed to delete. Id not found');
    }
  }
}

module.exports = SongService;
