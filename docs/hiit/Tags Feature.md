## Benefit
The purpose of the tags feature is to enable users to find and load their workouts with ease.

## Acceptance Criteria
- As a user I can:
	- Add tags to a workout definition and have them stored in the database
	- Remove tags from a workout definition and update the database
	- View all the tags used across all my workouts ("candidate tags")
		- Each tag should display the number of times (frequency) it has been used
			- If a tag's frequency ever drops to zero (because there are no longer workouts that reference that tag) it should not be displayed in the candidate tags
		- The tags list should (usually) be ordered by its frequency, most common first
	- Select a subset of all the tags in order to specify a subset of my workouts to scroll through
		- Display a count of the number of matching workouts and the total number of workouts

## Interaction Details
![[Pasted image 20231017094554.png]]

### Definition Mode
When the GUI is in "definition mode" (i.e. updating the definition of a single workout), a "tag bar" should display all the available tags. Clicking on an individual tag toggles the tag, i.e. it cycles between "attaching" and "detaching" the tag from the workout. When a tag is detached it should display with a distinctive background colour (for example "Rowing" and "Advanced" in the mockup above). When a tag is *not* attached it should have a different background (white or perhaps transparent) .
#### New Tags
A "New Tag" text entry field (NOT SHOWN) will allow a new tag to be added to the current workout - losing focus on this input will actually add the tag.

When the new tag is added it will be added to the tag list at the "head" (extreme left), will be selected, and have an initial count of 1.

If the user enters a "new" tag that in fact already exists, it will be added (if it is not already) and moved to the "head" of the list. It's count will increment if it was not already present on the current workout, otherwise it will remain the same.
### Search Mode
When the GUI is in "search mode", individual tags can be added and removed from the "tag search set" by clicking on them. Selected tags will be displayed with one background colour, unselected tabs will be displayed with another.

As tags are added and removed from the tag search set, the number of matching workouts will be displayed.

As tags are added, if the currently displayed workout still matches (i.e. has all the tags in the tag search set - and maybe more), then the displayed workout will not be adjusted. However, if it does not match, the workout will be changed to the first matching workout.
## Implementation Plan
1. Add a mode to the application state - either "Edit" or "Execute"
2. Add a method of toggling between the application modes - probably add an explicit "Edit"/"Execute" button
3. In "Edit" mode, display all our editing buttons (skip forward, back, +20 etc.).
4. In "Execute" mode, display just the "play/pause", "reset", "next" and "previous" buttons.
5. (In Edit mode, the tags should behave as described in "Definition Mode" above.)
6. (In Execute mode, the tags should behave as described in "Search Mode" above.)
7. Define a "Tag" component. It should take props for foreground, background and outline colours as well as a label (string) a count (number) and a selected (boolean) flag. It should display as a "[lozenge](https://raw.githubusercontent.com/riteshhgupta/TagCellLayout/0.3/TagCellLayout/Readme_Resources/tag_cc.png)". When clicked it should invoke an `onSelectionChanged(label, selected)` callback, passing it it's label and the new selection state.
8. If the Tag label corresponds to an emoji label (see for example [unicode-emoji-json](https://www.npmjs.com/package/unicode-emoji-json)), then the corresponding emoji should be displayed (using ), rather than the text of the label.
9. Define a "TagList" component. It should take a `tagState` prop which will be an object whose keys (properties) are the tag labels and values are a object containing a `count` (number) and `selected` (boolean). The TagList should render a Tag for each property in the `tagState` ordered by `count`:
   
   ```TypeScript
   Object.values(tagState)
	   .sort(([,lhs], [,rhs]) => lhs.count < rhs.count)
	   .map(([label, {count, selected}]) => {
		   <Tag label={label} selected={selected} /* other props */ />
	   })
```
9. The TagList will need to maintain the tagState by supplying an `onSelectionChanged` callback for each tag. Once the TagList has updated its tagState, it should invoke a supplied callback called `onTagStateChanged`, supplying it the updated TagState.
10. The "application component" should create the TagList and supply the `onTagStateChanged` callback. It should filter the workouts by tag (in Execute mode) or add and remove tags from the selected Workout (in Edit mode)
## Issues
- Should Workouts still be named? Maybe the name should be optional?
- How to you control the order of workouts?