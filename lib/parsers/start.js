/**
 * (c) 2017 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

"use strict";

const { Parser } = require( "parsing-stream" );

const Basics = require( "../basics" );
const Job = require( "../job" );


const UEL = Buffer.from( Basics.UEL, "ascii" );


/**
 * Parses stream for matching UEL sequence starting (another) PJL job.
 *
 * @type {StartParser}
 * @name StartParser
 */
module.exports = class StartParser extends Parser {
	/**
	 */
	constructor() {
		super();

		this._index = 0;
	}

	/**
	 * Parses provided buffer for containing data matching expectations.
	 *
	 * @param {Context} context reference on context for sharing results of parsing
	 * @param {Buffer} buffer slice of data to be parsed
	 * @param {int} atOffset provides offset of provided buffer in context of a larger file or stream
	 * @returns {Promise<ParserResult>}
	 */
	parse( context, buffer, atOffset ) {
		let matchIndex = this._index;

		for ( let read = 0, length = buffer.length; read < length; read++ ) {
			if ( buffer[read] === UEL[matchIndex] ) {
				matchIndex++;

				if ( matchIndex >= UEL.length ) {
					this._index = 0;

					const newJob = new Job();
					if ( !Array.isArray( context.jobs ) ) {
						context.jobs = [];
					}

					context.jobs.push( newJob );
					context.currentJob = newJob;

					return this._fullMatch( buffer, atOffset, read - matchIndex + 1, read, context.getParserByName( "pjl-command" ) );
				}
			} else {
				matchIndex = 0;
			}
		}

		this._index = matchIndex;

		return this._partialMatch( buffer, buffer.length - matchIndex );
	}
};
