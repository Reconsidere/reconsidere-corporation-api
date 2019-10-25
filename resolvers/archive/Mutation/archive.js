var fs = require('fs');
var mkdirp = require('mkdirp');
var path = '/reconsidere-corp/archives';
module.exports = picture = {
	Query: {
		async allArchives() {}
	},
	Mutation: {
		async uploadArchive(root, { _id, input }) {
			mkdirp(path, function(err) {
				if (err) console.error(err);
				else {
				}
			});

			var base64Data = input.file.split(';base64,').pop();
			fs.writeFile(`${path}/${input.name}`, base64Data, { encoding: 'base64' }, function(err) {
				if (err) {
					console.log(err);
					throw new Error('ERE009');
				} else {
				}
			});
			return input;
		}
	}
};
