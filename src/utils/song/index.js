const mapDBToModel = ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    album_id,
    created_at,
    updated_at
}) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId: album_id,
});

module.exports = { mapDBToModel };
