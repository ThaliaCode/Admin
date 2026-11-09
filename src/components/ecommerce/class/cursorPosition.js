class CursorPosition {
	constructor() {
		this.element = null;
		this.lastPosition = null;
		this.newText = null;
	}
	addText(newText) {
		this.newText = newText;
	}
	getLastProsition() {
		return this.lastPosition;
	}
	getText() {
		const startPosition = this.newText.indexOf('>', 1) + 1 + this.lastPosition;
		this.element.focus();
		this.element.setRangeText(this.newText, this.lastPosition, this.lastPosition);
		this.element.setSelectionRange(startPosition, startPosition);
		return this.element.value;
	}
	setLastPosition(val) {
		this.lastPosition = val;
	}
	setElement(element) {
		this.element = element;
	}
}
export default new CursorPosition();
