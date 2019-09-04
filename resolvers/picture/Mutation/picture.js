var fs = require('fs');
var mkdirp = require('mkdirp');
var path = '/reconsidere-corp/images';
module.exports = picture = {
	Query: {
		async allPictures() {}
	},
	Mutation: {
		async uploadImage(root, { _id, input }) {
			mkdirp(path, function(err) {
				if (err) console.error(err);
				else {
				}
			});

            console.log(input);
			var buf = new Buffer(input.image, 'base64');
			fs.writeFile(`${path}/${input.name}`, buf, 0, buffer.length, null, function(err) {
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
