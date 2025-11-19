"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const validator = {
    articleValidator: [
        (0, express_validator_1.body)("title", "veillez remplire votre nom").not().isEmpty(),
        (0, express_validator_1.body)("description", "veillez remplire votre email").not().isEmpty(),
        (0, express_validator_1.body)("prix", "veillez entrer un prix valide").isFloat(),
        (0, express_validator_1.body)("categorie", "veillez entrer une categorie valide").not().isEmpty(),
        (0, express_validator_1.body)("favoris", "veillez entrer un favoris valide").isBoolean(),
        (0, express_validator_1.body)("image", "veillez entrer une image valide").not().isEmpty(),
    ],
    tableValidator: [
        (0, express_validator_1.body)("numero", "entrer le numero de table").not().isEmpty(),
        (0, express_validator_1.body)("entrer la capaciter de la table").not().isEmpty(),
        (0, express_validator_1.body)("entrer le nombre raisonable").isLuhnNumber(),
        (0, express_validator_1.body)("entrer un nombre").isLuhnNumber()
    ]
};
exports.default = validator;
//# sourceMappingURL=validation.js.map