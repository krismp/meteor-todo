Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  Template.body.helpers({
    tasks: function(){
      if (Session.get("hideCompleted")) {
        // if hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      }else{
        // otherwise return all the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function(){
      return Session.get("hideCompleted");
    },
    incompleteCount: function(){
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      // prevent default browser form submit
      event.preventDefault();

      // get value from form element
      var text = event.target.text.value;

      // Insert a task into the collection
      Meteor.call("addTask", text);

      // clear form
      event.target.text.value = '';
    },
    "change, .hide-completed input": function (event){
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function(){
      Meteor.call("deleteTask", this._id);
    }
  });

  Account.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function(text){
    // make sure the user is logged in before inserting task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

  deleteTask: function(taskId){
    Tasks.remove(taskId);
  },

  setChecked: function(taskId, setChecked){
    Tasks.update(taskId, { $set: {checked: setChecked} });
  }
});