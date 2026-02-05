import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  type OldUserProfile = {
    email : Text;
    name : Text;
    age : Nat;
    username : Text;
  };

  type NewUserProfile = {
    email : Text;
    name : Text;
    age : Nat;
    username : Text;
    languagePreference : ?Language;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public type Language = {
    #english;
    #hindi;
    #marathi;
    #kannada;
    #tamil;
    #telugu;
    #spanish;
    #french;
  };

  public func run(old : OldActor) : NewActor {
    let convertedUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_key, oldProfile) {
        { oldProfile with languagePreference = null };
      }
    );
    { userProfiles = convertedUserProfiles };
  };
};
