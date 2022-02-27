const mapDBToModel = ({
   id,
   name,
   year,
   created_at,
   updated_at 
}) => ({
    id,
    name,
    year
});

module.exports = { mapDBToModel };
