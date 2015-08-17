define(function(require, exports, module) {
  "use strict";

  var Tree = require("../../../lib/tree");

  describe("Tree", function() {
    beforeEach(function() {
      this.stack = [
        {
          "name": "START_EXPR",
          "capture": [
            "{%"
          ]
        },
        {
          "name": "START_IF",
          "capture": [
            "if"
          ],
          "previous": {
            "name": "START_EXPR",
            "capture": [
              "{%"
            ]
          }
        },
        {
          "name": "WHITESPACE",
          "capture": [
            " "
          ],
          "previous": {
            "name": "START_IF",
            "capture": [
              "if"
            ],
            "previous": {
              "name": "START_EXPR",
              "capture": [
                "{%"
              ]
            }
          }
        },
        {
          "name": "OTHER",
          "capture": [
            "cond",
            "d"
          ],
          "previous": {
            "name": "WHITESPACE",
            "capture": [
              " "
            ],
            "previous": {
              "name": "START_IF",
              "capture": [
                "if"
              ],
              "previous": {
                "name": "START_EXPR",
                "capture": [
                  "{%"
                ]
              }
            }
          }
        },
        {
          "name": "END_EXPR",
          "capture": [
            "%}"
          ],
          "previous": {
            "name": "OTHER",
            "capture": [
              "cond",
              "d"
            ],
            "previous": {
              "name": "WHITESPACE",
              "capture": [
                " "
              ],
              "previous": {
                "name": "START_IF",
                "capture": [
                  "if"
                ],
                "previous": {
                  "name": "START_EXPR",
                  "capture": [
                    "{%"
                  ]
                }
              }
            }
          }
        },
        {
          "name": "START_EXPR",
          "capture": [
            "{%"
          ],
          "previous": {
            "name": "END_EXPR",
            "capture": [
              "%}"
            ],
            "previous": {
              "name": "OTHER",
              "capture": [
                "cond",
                "d"
              ],
              "previous": {
                "name": "WHITESPACE",
                "capture": [
                  " "
                ],
                "previous": {
                  "name": "START_IF",
                  "capture": [
                    "if"
                  ],
                  "previous": {
                    "name": "START_EXPR",
                    "capture": [
                      "{%"
                    ]
                  }
                }
              }
            }
          }
        },
        {
          "name": "ELSE",
          "capture": [
            "else"
          ],
          "previous": {
            "name": "START_EXPR",
            "capture": [
              "{%"
            ],
            "previous": {
              "name": "END_EXPR",
              "capture": [
                "%}"
              ],
              "previous": {
                "name": "OTHER",
                "capture": [
                  "cond",
                  "d"
                ],
                "previous": {
                  "name": "WHITESPACE",
                  "capture": [
                    " "
                  ],
                  "previous": {
                    "name": "START_IF",
                    "capture": [
                      "if"
                    ],
                    "previous": {
                      "name": "START_EXPR",
                      "capture": [
                        "{%"
                      ]
                    }
                  }
                }
              }
            }
          }
        },
        {
          "name": "END_EXPR",
          "capture": [
            "%}"
          ],
          "previous": {
            "name": "ELSE",
            "capture": [
              "else"
            ],
            "previous": {
              "name": "START_EXPR",
              "capture": [
                "{%"
              ],
              "previous": {
                "name": "END_EXPR",
                "capture": [
                  "%}"
                ],
                "previous": {
                  "name": "OTHER",
                  "capture": [
                    "cond",
                    "d"
                  ],
                  "previous": {
                    "name": "WHITESPACE",
                    "capture": [
                      " "
                    ],
                    "previous": {
                      "name": "START_IF",
                      "capture": [
                        "if"
                      ],
                      "previous": {
                        "name": "START_EXPR",
                        "capture": [
                          "{%"
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "name": "START_EXPR",
          "capture": [
            "{%"
          ],
          "previous": {
            "name": "END_EXPR",
            "capture": [
              "%}"
            ],
            "previous": {
              "name": "ELSE",
              "capture": [
                "else"
              ],
              "previous": {
                "name": "START_EXPR",
                "capture": [
                  "{%"
                ],
                "previous": {
                  "name": "END_EXPR",
                  "capture": [
                    "%}"
                  ],
                  "previous": {
                    "name": "OTHER",
                    "capture": [
                      "cond",
                      "d"
                    ],
                    "previous": {
                      "name": "WHITESPACE",
                      "capture": [
                        " "
                      ],
                      "previous": {
                        "name": "START_IF",
                        "capture": [
                          "if"
                        ],
                        "previous": {
                          "name": "START_EXPR",
                          "capture": [
                            "{%"
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "name": "END_IF",
          "capture": [
            "endif"
          ],
          "previous": {
            "name": "START_EXPR",
            "capture": [
              "{%"
            ],
            "previous": {
              "name": "END_EXPR",
              "capture": [
                "%}"
              ],
              "previous": {
                "name": "ELSE",
                "capture": [
                  "else"
                ],
                "previous": {
                  "name": "START_EXPR",
                  "capture": [
                    "{%"
                  ],
                  "previous": {
                    "name": "END_EXPR",
                    "capture": [
                      "%}"
                    ],
                    "previous": {
                      "name": "OTHER",
                      "capture": [
                        "cond",
                        "d"
                      ],
                      "previous": {
                        "name": "WHITESPACE",
                        "capture": [
                          " "
                        ],
                        "previous": {
                          "name": "START_IF",
                          "capture": [
                            "if"
                          ],
                          "previous": {
                            "name": "START_EXPR",
                            "capture": [
                              "{%"
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          "name": "END_EXPR",
          "capture": [
            "%}"
          ],
          "previous": {
            "name": "END_IF",
            "capture": [
              "endif"
            ],
            "previous": {
              "name": "START_EXPR",
              "capture": [
                "{%"
              ],
              "previous": {
                "name": "END_EXPR",
                "capture": [
                  "%}"
                ],
                "previous": {
                  "name": "ELSE",
                  "capture": [
                    "else"
                  ],
                  "previous": {
                    "name": "START_EXPR",
                    "capture": [
                      "{%"
                    ],
                    "previous": {
                      "name": "END_EXPR",
                      "capture": [
                        "%}"
                      ],
                      "previous": {
                        "name": "OTHER",
                        "capture": [
                          "cond",
                          "d"
                        ],
                        "previous": {
                          "name": "WHITESPACE",
                          "capture": [
                            " "
                          ],
                          "previous": {
                            "name": "START_IF",
                            "capture": [
                              "if"
                            ],
                            "previous": {
                              "name": "START_EXPR",
                              "capture": [
                                "{%"
                              ]
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ];
    });

    it("is a constructor", function() {
      assert(typeof Tree === "function");
    });

    it("ensures els property has a type", function() {
      var tree = new Tree(this.stack).make();
      assert.equal(tree.nodes[0].els.type, 'ConditionalExpression');
    });
  });
});
